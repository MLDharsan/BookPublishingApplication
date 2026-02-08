export default function AdminPaymentsPage() {
  return (
    <div className="rounded-2xl border p-6 space-y-2">
      <h2 className="text-lg font-semibold">Payments</h2>
      <p className="text-sm text-muted-foreground">
        Coming soon: payment verification, approve/reject orders, and unlock downloads.
      </p>

      <div className="text-sm text-muted-foreground">
        Next we will build:
        <ul className="list-disc pl-5 mt-2">
          <li>Orders table (pending/approved/rejected)</li>
          <li>Payment proof upload (screenshot/reference)</li>
          <li>Admin approval actions</li>
          <li>Sales counts per book + buyer list</li>
        </ul>
      </div>
    </div>
  );
}
