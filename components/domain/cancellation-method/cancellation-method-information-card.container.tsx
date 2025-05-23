import "server-only";

import { fetchCancellationMethod } from "./_lib/fetcher";
import CancellationMethodInformationCardPresentation from "./cancellation-method-information-card.presentation";

export default async function CancellationMethodInformationCardContainer({
  cancellationMethodId,
}: {
  cancellationMethodId: string;
}) {
  const cancellationMethod = cancellationMethodId
    ? await fetchCancellationMethod(cancellationMethodId)
    : undefined;
  return (
    <>
      {cancellationMethod ? (
        <CancellationMethodInformationCardPresentation
          cancellationMethod={cancellationMethod}
        />
      ) : (
        <p className="text-center">解約方法が結びつけられていません。</p>
      )}
    </>
  );
}
