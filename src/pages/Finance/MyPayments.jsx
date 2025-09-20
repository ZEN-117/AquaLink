// src/pages/Finance/MyPayments.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function MyPayments() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/buyer/payments")
      .then(({ data }) => setItems(data))
      .catch(() => setItems([]));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Payments</h1>
        <p className="text-muted-foreground">Your payments for orders only</p>
      </div>

      <Card className="border-aqua/10">
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>Order-related payments linked to your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {items.map((p) => (
            <div
              key={p._id}
              className="flex items-center justify-between p-3 rounded-lg border border-aqua/10"
            >
              <div>
                <div className="font-semibold">
                  ${Number(p.amount || 0).toFixed(2)} — {p.method}
                </div>
                <div className="text-sm text-muted-foreground">
                  {p.description || "Order payment"}
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                {p.date ? new Date(p.date).toLocaleDateString() : ""}
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="text-muted-foreground">No payments found.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
