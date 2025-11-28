/**
 * {
  "stats": {
    "sales_today": "190000.00",
    "expenses_today": "135000.00",
    "benefit_today": 55000,
    "sales_month": "190000.00",
    "expenses_month": "135000.00",
    "benefit_month": 55000,
    "critical_stock": 3,
    "total_due": "0.00"
  },
  "top_products": {
    "Robe Ankara": 2
  },
  "sales_by_day": [
    {
      "date": "2025-11-27",
      "total": "190000.00"
    }
  ]
}
 */

export interface MetricsStats {
    stats: {
        sales_today: string;
        expenses_today: string;
        benefit_today: number;
        sales_month: string;
        expenses_month: string;
        benefit_month: number;
        critical_stock: number;
        total_due: string;
    };
  top_products: Record<string, number>;
  sales_by_day: Array<{
    date: string;
    total: string;
  }>;
  expenses_by_category?: Array<{
    name: string;
    value: number;
  }>;
}

export interface TopProducts{

}