import SubscriptionForm from "@/components/domain/subscription/subscription-form";

export default function Page() {
  return (
    <main className="flex-1 p-6">
      <div className="mx-auto max-w-2xl">
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="font-bold text-2xl">サブスクリプションを追加</h1>
            <p className="mt-1 text-muted-foreground text-sm">
              新しいサブスクリプションの詳細を入力してください
            </p>
          </div>
          <SubscriptionForm />
        </div>
      </div>
    </main>
  );
}
