import { Suspense } from "react";
import ViewQuoteClient from "../components/view-quote-component";

export default function ViewQuotePage() {
  return (
    <Suspense fallback={<div>Loading quote...</div>}>
      <ViewQuoteClient />
    </Suspense>
  );
}
