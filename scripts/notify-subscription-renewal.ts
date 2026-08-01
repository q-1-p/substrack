import { addDays, formatDate } from "date-fns";
import { eq } from "drizzle-orm";
import nodemailer from "nodemailer";

import { db } from "@/infrastructure/index";
import { subscriptionsTable, usersTable } from "@/infrastructure/schema";

export const sendMail = async () => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASSWORD,
    },
  });

  const nextDate = formatDate(addDays(new Date(), 1), "yyyy-MM-dd");
  const subscriptions: Map<string, string[]> = await db
    .select({
      mailAddress: usersTable.mailAddress,
      subscriptionName: subscriptionsTable.name,
    })
    .from(subscriptionsTable)
    .where(eq(subscriptionsTable.nextUpdate, nextDate))
    .leftJoin(usersTable, eq(subscriptionsTable.userId, usersTable.id))
    .then((res) =>
      res.reduce((acc, item) => {
        // mailAddressがnullの場合はスキップ
        if (item.mailAddress === null) {
          return acc;
        }

        if (!acc.has(item.mailAddress)) {
          acc.set(item.mailAddress, []);
        }
        acc.get(item.mailAddress)?.push(item.subscriptionName);
        return acc;
      }, new Map<string, string[]>()),
    );

  for (const [mailAddress, subscriptionNames] of subscriptions) {
    const mailOptions = {
      from: `さぶ空く <${process.env.MAIL_ADDRESS_FOR_NOTIFICATION}>`,
      to: mailAddress,
      subject: "サブスク更新通知メール",
      text: `明日、以下のサブスクが更新されます

${subscriptionNames.map((name) => `・${name}`).join("\n")}

---------------------
配信元:       さぶ空く - サブスク管理サービス
サービスURL:  https://substrack.jp
問い合わせ先: https://tricky-chokeberry-957.notion.site/2051ac83cb968081bd9eecb412a31e92?pvs=105
配信停止:     http://substrack.jp/app/dashboard から、登録しているサブスクを全て削除してください
---------------------`,
    };

    let retryCount = 0;
    while (retryCount < 3) {
      try {
        await transporter.sendMail(mailOptions);
        break;
      } catch (error) {
        retryCount++;
        console.warn("メール送信時にエラーが発生しました:", error);
        if (3 <= retryCount) {
          throw error;
        }
        await new Promise((resolve) => setTimeout(resolve, 60 * 1000));
      }
    }
  }

  console.log(`${subscriptions.size}件のメールを送信しました`);
};

// スクリプトが直接実行された場合にシード関数を実行
if (require.main === module) {
  sendMail()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("メール送信でエラーが発生しました:", error);
      process.exit(1);
    });
}
