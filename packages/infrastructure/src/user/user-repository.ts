import { clerkClient } from "@clerk/nextjs/server";
import { eq, sql } from "drizzle-orm";

import { db, dbSocket } from "..";

import { type UserId, validateUserId } from "@/domain/type";
import { err, ok, type Result } from "@/functional/result";
import { subscriptionsTable, usersTable } from "@/infrastructure/schema";

import type { IUserRepository } from "@/domain/user/user-repository";

const findUserQuery = db.query.usersTable
  .findFirst({
    where: (user) => eq(user.clerkId, sql.placeholder("clerkUserId")),
  })
  .prepare("find");

export class UserRepository implements IUserRepository {
  public findId = async (
    clerkUserId: string,
  ): Promise<Result<UserId, undefined>> => {
    return findUserQuery
      .execute({ clerkUserId })
      .then((user) => {
        if (!user) {
          throw new Error("User not found");
        }

        const userIdResult = validateUserId(user.id);
        if (userIdResult.type === err) {
          throw new Error("Invalid user ID");
        }

        return {
          type: ok as typeof ok,
          value: userIdResult.value,
        };
      })
      .catch((error) => {
        console.error(error);
        return { type: err as typeof err, error: undefined };
      });
  };

  public updateMailAddress = async (
    userId: UserId,
    mailAddress: string,
  ): Promise<boolean> => {
    return db
      .update(usersTable)
      .set({ mailAddress })
      .where(eq(usersTable.id, userId))
      .then(() => true)
      .catch((error) => {
        console.error("Failed to update mail address", error);
        return false;
      });
  };

  public delete = async (
    userId: UserId,
    clerkUserId: string,
  ): Promise<boolean> => {
    return dbSocket
      .transaction(async (tx) => {
        await tx
          .delete(subscriptionsTable)
          .where(eq(subscriptionsTable.userId, userId));
        await tx.delete(usersTable).where(eq(usersTable.id, userId));

        await (await clerkClient()).users.deleteUser(clerkUserId);
      })
      .then(() => true)
      .catch((error) => {
        console.error("Failed to delete user", error);
        return false;
      });
  };
}
