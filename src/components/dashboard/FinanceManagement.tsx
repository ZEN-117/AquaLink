import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Download,
  CreditCard,
  Wallet
} from "lucide-react";

const FinanceManagement = () => {
  const earnings = [
    { month: "January", amount: 2840, growth: 12 },
    { month: "February", amount: 3200, growth: 18 },
    { month: "March", amount: 2950, growth: -8 },
    { month: "April", amount: 3680, growth: 25 },
  ];

  const transactions = [
    {
      id: "TXN001",
      type: "Sale",
      description: "Rainbow Guppy Male - Order #1234",
      amount: "+$25.00",
      date: "2024-01-15",
      status: "Completed"
    },
    {
      id: "TXN002", 
      type: "Sale",
      description: "Blue Moscow Guppy Pair - Order #1235",
      amount: "+$18.00",
      date: "2024-01-14",
      status: "Completed"
    },
    {
      id: "TXN003",
      type: "Withdrawal",
      description: "Bank Transfer to Chase ****1234",
      amount: "-$500.00",
      date: "2024-01-13",
      status: "Processing"
    },
    {
      id: "TXN004",
      type: "Refund",
      description: "Order #1230 - Customer Return",
      amount: "-$15.00",
      date: "2024-01-12",
      status: "Completed"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-500/10 text-green-500";
      case "Processing":
        return "bg-yellow-500/10 text-yellow-500";
      case "Failed":
        return "bg-red-500/10 text-red-500";
      default:
        return "bg-gray-500/10 text-gray-500";
    }
  };

  const getAmountColor = (amount: string) => {
    return amount.startsWith('+') ? 'text-green-500' : 'text-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Finance Management</h1>
          <p className="text-muted-foreground">Track your earnings, payments, and financial analytics</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-aqua/20 hover:bg-aqua/10">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button className="bg-gradient-aqua hover:opacity-90">
            <Wallet className="w-4 h-4 mr-2" />
            Withdraw Funds
          </Button>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="animate-fade-in border-aqua/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
            <div className="p-2 rounded-lg bg-aqua/10">
              <DollarSign className="w-4 h-4 text-aqua" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">$1,247.82</div>
            <p className="text-xs text-muted-foreground">
              Ready for withdrawal
            </p>
          </CardContent>
        </Card>

        <Card className="animate-fade-in border-aqua/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <div className="p-2 rounded-lg bg-green-500/10">
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">$3,680.00</div>
            <p className="text-xs text-green-500">
              +25% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="animate-fade-in border-aqua/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <div className="p-2 rounded-lg bg-blue-500/10">
              <CreditCard className="w-4 h-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">$12,870.00</div>
            <p className="text-xs text-muted-foreground">
              Lifetime earnings
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Earnings Chart */}
      <Card className="animate-fade-in border-aqua/10">
        <CardHeader>
          <CardTitle>Monthly Earnings</CardTitle>
          <CardDescription>Your earnings performance over the last 4 months</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {earnings.map((month, index) => (
              <div 
                key={month.month} 
                className="flex items-center justify-between p-4 rounded-lg bg-aqua/5 hover:bg-aqua/10 transition-colors"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center gap-4">
                  <Calendar className="w-5 h-5 text-aqua" />
                  <div>
                    <h3 className="font-medium text-foreground">{month.month}</h3>
                    <p className="text-sm text-muted-foreground">Monthly earnings</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-foreground">
                    ${month.amount.toLocaleString()}
                  </div>
                  <div className={`flex items-center gap-1 text-sm ${
                    month.growth >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {month.growth >= 0 ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    {Math.abs(month.growth)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card className="animate-fade-in border-aqua/10">
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>Recent payments, sales, and withdrawals</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.map((transaction, index) => (
              <div 
                key={transaction.id}
                className="flex items-center justify-between p-4 rounded-lg border border-aqua/10 hover:bg-aqua/5 transition-colors"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-foreground">{transaction.type}</span>
                    <Badge className={getStatusColor(transaction.status)}>
                      {transaction.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{transaction.description}</p>
                  <p className="text-xs text-muted-foreground">{transaction.date}</p>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${getAmountColor(transaction.amount)}`}>
                    {transaction.amount}
                  </div>
                  <p className="text-xs text-muted-foreground">{transaction.id}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinanceManagement;