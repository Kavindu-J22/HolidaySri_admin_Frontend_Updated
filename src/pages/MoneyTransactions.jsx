import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  Plus,
  Search,
  Filter,
  Calendar,
  Download,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  X,
  ChevronDown,
  FileSpreadsheet
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { adminAPI } from '../config/api';

const MoneyTransactions = () => {
  const [activeTab, setActiveTab] = useState('earnings'); // 'earnings' or 'expenses'
  const [summary, setSummary] = useState({
    totalEarnings: 0,
    earningsCount: 0,
    totalExpenses: 0,
    expensesCount: 0,
    totalProfit: 0,
    profitMargin: 0
  });
  const [earnings, setEarnings] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  
  // Pagination
  const [earningsPagination, setEarningsPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
    limit: 20
  });
  const [expensesPagination, setExpensesPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
    limit: 20
  });
  
  // Filters
  const [earningsFilters, setEarningsFilters] = useState({
    search: '',
    transactionType: 'all',
    paymentGateway: 'all',
    status: 'all',
    category: 'all',
    startDate: '',
    endDate: ''
  });
  
  const [expensesFilters, setExpensesFilters] = useState({
    search: '',
    expenseType: 'all',
    paymentStatus: 'all',
    paymentMethod: 'all',
    startDate: '',
    endDate: ''
  });
  
  const [expenseForm, setExpenseForm] = useState({
    expenseType: 'Operational',
    category: '',
    description: '',
    amountLKR: '',
    vendorName: '',
    vendorEmail: '',
    vendorPhone: '',
    vendorAddress: '',
    paymentMethod: 'Bank Transfer',
    paymentStatus: 'paid',
    paymentDate: new Date().toISOString().split('T')[0],
    transactionId: '',
    invoiceNumber: '',
    receiptNumber: '',
    paidBy: '',
    approvedBy: '',
    department: '',
    notes: '',
    taxAmount: 0,
    taxPercentage: 0
  });

  useEffect(() => {
    fetchSummary();
    if (activeTab === 'earnings') {
      fetchEarnings();
    } else {
      fetchExpenses();
    }
  }, [activeTab, earningsFilters, expensesFilters, earningsPagination.current, expensesPagination.current]);

  const fetchSummary = async () => {
    try {
      const response = await adminAPI.getFinancialSummary({
        startDate: earningsFilters.startDate || expensesFilters.startDate,
        endDate: earningsFilters.endDate || expensesFilters.endDate
      });
      setSummary(response.data.summary);
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  };

  const fetchEarnings = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getEarnings({
        page: earningsPagination.current,
        limit: earningsPagination.limit,
        ...earningsFilters
      });
      setEarnings(response.data.transactions);
      setEarningsPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching earnings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getExpenses({
        page: expensesPagination.current,
        limit: expensesPagination.limit,
        ...expensesFilters
      });
      setExpenses(response.data.expenses);
      setExpensesPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExpense = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (editingExpense) {
        await adminAPI.updateExpense(editingExpense._id, expenseForm);
      } else {
        await adminAPI.createExpense(expenseForm);
      }
      setShowExpenseForm(false);
      setEditingExpense(null);
      resetExpenseForm();
      fetchExpenses();
      fetchSummary();
    } catch (error) {
      console.error('Error saving expense:', error);
      alert('Failed to save expense');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExpense = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;

    try {
      await adminAPI.deleteExpense(id);
      fetchExpenses();
      fetchSummary();
    } catch (error) {
      console.error('Error deleting expense:', error);
      alert('Failed to delete expense');
    }
  };

  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
    setExpenseForm({
      expenseType: expense.expenseType,
      category: expense.category,
      description: expense.description,
      amountLKR: expense.amountLKR,
      vendorName: expense.vendorName,
      vendorEmail: expense.vendorEmail || '',
      vendorPhone: expense.vendorPhone || '',
      vendorAddress: expense.vendorAddress || '',
      paymentMethod: expense.paymentMethod,
      paymentStatus: expense.paymentStatus,
      paymentDate: new Date(expense.paymentDate).toISOString().split('T')[0],
      transactionId: expense.transactionId || '',
      invoiceNumber: expense.invoiceNumber || '',
      receiptNumber: expense.receiptNumber || '',
      paidBy: expense.paidBy || '',
      approvedBy: expense.approvedBy || '',
      department: expense.department || '',
      notes: expense.notes || '',
      taxAmount: expense.taxAmount || 0,
      taxPercentage: expense.taxPercentage || 0
    });
    setShowExpenseForm(true);
  };

  const resetExpenseForm = () => {
    setExpenseForm({
      expenseType: 'Operational',
      category: '',
      description: '',
      amountLKR: '',
      vendorName: '',
      vendorEmail: '',
      vendorPhone: '',
      vendorAddress: '',
      paymentMethod: 'Bank Transfer',
      paymentStatus: 'paid',
      paymentDate: new Date().toISOString().split('T')[0],
      transactionId: '',
      invoiceNumber: '',
      receiptNumber: '',
      paidBy: '',
      approvedBy: '',
      department: '',
      notes: '',
      taxAmount: 0,
      taxPercentage: 0
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const downloadExcelReport = async () => {
    try {
      setLoading(true);

      // Fetch ALL earnings and expenses (high limit to get everything)
      const [earningsRes, expensesRes] = await Promise.all([
        adminAPI.getEarnings({ page: 1, limit: 9999, ...earningsFilters }),
        adminAPI.getExpenses({ page: 1, limit: 9999, ...expensesFilters })
      ]);

      const allEarnings = earningsRes.data.transactions || [];
      const allExpenses = expensesRes.data.expenses || [];

      const wb = XLSX.utils.book_new();

      // ── Sheet 1: Summary ──
      const summaryData = [
        ['HolidaySri - Financial Report'],
        ['Generated On:', new Date().toLocaleString()],
        [],
        ['SUMMARY'],
        ['Metric', 'Value (LKR)'],
        ['Total Earnings', summary.totalEarnings],
        ['Total Expenses', summary.totalExpenses],
        ['Total Profit', summary.totalProfit],
        ['Profit Margin (%)', summary.profitMargin],
        ['Earnings Transactions', summary.earningsCount],
        ['Expense Records', summary.expensesCount],
      ];
      const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
      wsSummary['!cols'] = [{ wch: 28 }, { wch: 22 }];
      XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

      // ── Sheet 2: Earnings ──
      const earningsHeader = [
        'Date', 'User Name', 'User Email', 'Description',
        'Category', 'Transaction Type', 'Payment Gateway',
        'Amount (LKR)', 'Status'
      ];
      const earningsRows = allEarnings.map((t) => [
        formatDate(t.createdAt),
        t.userName || '',
        t.userEmail || '',
        t.description || '',
        t.category || '',
        t.transactionType || '',
        t.paymentGateway || '',
        t.amountLKR || 0,
        t.status || ''
      ]);
      const wsEarnings = XLSX.utils.aoa_to_sheet([earningsHeader, ...earningsRows]);
      wsEarnings['!cols'] = [
        { wch: 22 }, { wch: 20 }, { wch: 28 }, { wch: 35 },
        { wch: 18 }, { wch: 18 }, { wch: 16 }, { wch: 16 }, { wch: 12 }
      ];
      XLSX.utils.book_append_sheet(wb, wsEarnings, 'Earnings');

      // ── Sheet 3: Expenses ──
      const expensesHeader = [
        'Payment Date', 'Vendor Name', 'Vendor Email', 'Description',
        'Expense Type', 'Category', 'Payment Method', 'Payment Status',
        'Amount (LKR)', 'Tax Amount (LKR)', 'Tax %',
        'Transaction ID', 'Invoice No', 'Receipt No',
        'Paid By', 'Approved By', 'Department', 'Notes'
      ];
      const expensesRows = allExpenses.map((e) => [
        formatDate(e.paymentDate),
        e.vendorName || '',
        e.vendorEmail || '',
        e.description || '',
        e.expenseType || '',
        e.category || '',
        e.paymentMethod || '',
        e.paymentStatus || '',
        e.amountLKR || 0,
        e.taxAmount || 0,
        e.taxPercentage || 0,
        e.transactionId || '',
        e.invoiceNumber || '',
        e.receiptNumber || '',
        e.paidBy || '',
        e.approvedBy || '',
        e.department || '',
        e.notes || ''
      ]);
      const wsExpenses = XLSX.utils.aoa_to_sheet([expensesHeader, ...expensesRows]);
      wsExpenses['!cols'] = [
        { wch: 22 }, { wch: 20 }, { wch: 28 }, { wch: 35 },
        { wch: 18 }, { wch: 18 }, { wch: 16 }, { wch: 16 },
        { wch: 16 }, { wch: 16 }, { wch: 10 },
        { wch: 18 }, { wch: 16 }, { wch: 16 },
        { wch: 16 }, { wch: 16 }, { wch: 16 }, { wch: 30 }
      ];
      XLSX.utils.book_append_sheet(wb, wsExpenses, 'Expenses');

      // Download
      const fileName = `HolidaySri_Financial_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);
    } catch (error) {
      console.error('Error generating Excel report:', error);
      alert('Failed to generate Excel report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Money Transactions
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track company earnings and expenses
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={downloadExcelReport}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed text-white rounded-lg font-medium text-sm transition-colors shadow-sm"
            title="Download Earnings & Expenses as Excel Report"
          >
            <FileSpreadsheet className="w-4 h-4" />
            {loading ? 'Generating...' : 'Download XL Report'}
          </button>
          <button
            onClick={() => {
              fetchSummary();
              activeTab === 'earnings' ? fetchEarnings() : fetchExpenses();
            }}
            className="btn-secondary flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Earnings */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border-2 border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-green-800 dark:text-green-400">
              Total Earnings (LKR)
            </h3>
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-green-900 dark:text-green-300">
            {formatCurrency(summary.totalEarnings)}
          </p>
          <p className="text-sm text-green-700 dark:text-green-400 mt-2">
            {summary.earningsCount.toLocaleString()} transactions
          </p>
        </div>

        {/* Total Expenses */}
        <div className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 rounded-xl p-6 border-2 border-red-200 dark:border-red-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-400">
              Total Expenses (LKR)
            </h3>
            <TrendingDown className="w-6 h-6 text-red-600" />
          </div>
          <p className="text-3xl font-bold text-red-900 dark:text-red-300">
            {formatCurrency(summary.totalExpenses)}
          </p>
          <p className="text-sm text-red-700 dark:text-red-400 mt-2">
            {summary.expensesCount.toLocaleString()} expenses
          </p>
        </div>

        {/* Total Profit */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border-2 border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-400">
              Total Company Profit (LKR)
            </h3>
            <Wallet className="w-6 h-6 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-blue-900 dark:text-blue-300">
            {formatCurrency(summary.totalProfit)}
          </p>
          <p className="text-sm text-blue-700 dark:text-blue-400 mt-2">
            Profit Margin: {summary.profitMargin}%
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex">
            <button
              onClick={() => setActiveTab('earnings')}
              className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'earnings'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Earnings
              </div>
            </button>
            <button
              onClick={() => setActiveTab('expenses')}
              className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'expenses'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <TrendingDown className="w-4 h-4" />
                Expenses
              </div>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'earnings' ? (
            <EarningsTab
              earnings={earnings}
              loading={loading}
              filters={earningsFilters}
              setFilters={setEarningsFilters}
              pagination={earningsPagination}
              setPagination={setEarningsPagination}
              formatCurrency={formatCurrency}
              formatDate={formatDate}
            />
          ) : (
            <ExpensesTab
              expenses={expenses}
              loading={loading}
              filters={expensesFilters}
              setFilters={setExpensesFilters}
              pagination={expensesPagination}
              setPagination={setExpensesPagination}
              showExpenseForm={showExpenseForm}
              setShowExpenseForm={setShowExpenseForm}
              expenseForm={expenseForm}
              setExpenseForm={setExpenseForm}
              handleCreateExpense={handleCreateExpense}
              handleEditExpense={handleEditExpense}
              handleDeleteExpense={handleDeleteExpense}
              editingExpense={editingExpense}
              setEditingExpense={setEditingExpense}
              resetExpenseForm={resetExpenseForm}
              formatCurrency={formatCurrency}
              formatDate={formatDate}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// Earnings Tab Component
const EarningsTab = ({ earnings, loading, filters, setFilters, pagination, setPagination, formatCurrency, formatDate }) => {
  const [downloading, setDownloading] = useState(false);

  const downloadEarningsReport = async () => {
    try {
      setDownloading(true);
      const response = await adminAPI.getEarnings({ page: 1, limit: 9999, ...filters });
      const allEarnings = response.data.transactions || [];

      const wb = XLSX.utils.book_new();

      // Summary block at top
      const now = new Date();
      const summaryBlock = [
        ['HolidaySri - Earnings Report'],
        ['Generated On:', now.toLocaleString()],
        ['Total Records:', allEarnings.length],
        ['Filters Applied:',
          [
            filters.search ? `Search: "${filters.search}"` : '',
            filters.transactionType !== 'all' ? `Type: ${filters.transactionType}` : '',
            filters.paymentGateway !== 'all' ? `Gateway: ${filters.paymentGateway}` : '',
            filters.status !== 'all' ? `Status: ${filters.status}` : '',
            filters.startDate ? `From: ${filters.startDate}` : '',
            filters.endDate ? `To: ${filters.endDate}` : '',
          ].filter(Boolean).join(' | ') || 'None'
        ],
        [],
      ];

      const header = [
        'Date', 'User Name', 'User Email', 'Description',
        'Category', 'Transaction Type', 'Payment Gateway',
        'Amount (LKR)', 'Status'
      ];
      const rows = allEarnings.map((t) => [
        formatDate(t.createdAt),
        t.userName || '',
        t.userEmail || '',
        t.description || '',
        t.category || '',
        t.transactionType || '',
        t.paymentGateway || '',
        t.amountLKR || 0,
        t.status || ''
      ]);

      // Total row
      const totalEarnings = allEarnings.reduce((sum, t) => sum + (t.amountLKR || 0), 0);
      const totalRow = ['', '', '', '', '', '', 'TOTAL (LKR)', totalEarnings, ''];

      const ws = XLSX.utils.aoa_to_sheet([...summaryBlock, header, ...rows, [], totalRow]);
      ws['!cols'] = [
        { wch: 22 }, { wch: 20 }, { wch: 28 }, { wch: 35 },
        { wch: 18 }, { wch: 18 }, { wch: 16 }, { wch: 16 }, { wch: 12 }
      ];
      XLSX.utils.book_append_sheet(wb, ws, 'Earnings');

      const dateStr = now.toISOString().split('T')[0];
      XLSX.writeFile(wb, `HolidaySri_Earnings_Report_${dateStr}.xlsx`);
    } catch (error) {
      console.error('Error generating earnings report:', error);
      alert('Failed to generate Earnings report. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Earnings Records
        </h3>
        <button
          onClick={downloadEarningsReport}
          disabled={downloading}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed text-white rounded-lg font-medium text-sm transition-colors shadow-sm"
          title="Download current Earnings records as Excel"
        >
          <FileSpreadsheet className="w-4 h-4" />
          {downloading ? 'Generating...' : 'Download Earnings XL'}
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Search
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              placeholder="Search transactions..."
              className="input pl-10"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Transaction Type
          </label>
          <select
            value={filters.transactionType}
            onChange={(e) => setFilters({ ...filters, transactionType: e.target.value })}
            className="input"
          >
            <option value="all">All Types</option>
            <option value="HSC_PURCHASE">HSC Purchase</option>
            <option value="HSC_SPEND">HSC Spend</option>
            <option value="REFUND">Refund</option>
            <option value="WITHDRAWAL">Withdrawal</option>
            <option value="EARNING_PAYOUT">Earning Payout</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Payment Gateway
          </label>
          <select
            value={filters.paymentGateway}
            onChange={(e) => setFilters({ ...filters, paymentGateway: e.target.value })}
            className="input"
          >
            <option value="all">All Gateways</option>
            <option value="PayHere">PayHere</option>
            <option value="Stripe">Stripe</option>
            <option value="PayPal">PayPal</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Manual">Manual</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="input"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Start Date
          </label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            className="input"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            End Date
          </label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            className="input"
          />
        </div>
      </div>

      {/* Earnings Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Gateway
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Amount (LKR)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {loading ? (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center">
                  <div className="flex justify-center">
                    <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                  </div>
                </td>
              </tr>
            ) : earnings.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                  No earnings found
                </td>
              </tr>
            ) : (
              earnings.map((transaction) => (
                <tr key={transaction._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {formatDate(transaction.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {transaction.userName}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {transaction.userEmail}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {transaction.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {transaction.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {transaction.paymentGateway}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600 dark:text-green-400">
                    {formatCurrency(transaction.amountLKR)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      transaction.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                      transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      transaction.status === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                    }`}>
                      {transaction.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing {((pagination.current - 1) * pagination.limit) + 1} to {Math.min(pagination.current * pagination.limit, pagination.total)} of {pagination.total} results
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPagination({ ...pagination, current: pagination.current - 1 })}
              disabled={pagination.current === 1}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setPagination({ ...pagination, current: pagination.current + 1 })}
              disabled={pagination.current === pagination.pages}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Expenses Tab Component
const ExpensesTab = ({
  expenses,
  loading,
  filters,
  setFilters,
  pagination,
  setPagination,
  showExpenseForm,
  setShowExpenseForm,
  expenseForm,
  setExpenseForm,
  handleCreateExpense,
  handleEditExpense,
  handleDeleteExpense,
  editingExpense,
  setEditingExpense,
  resetExpenseForm,
  formatCurrency,
  formatDate
}) => {
  const [downloading, setDownloading] = useState(false);

  const expenseTypes = [
    'Operational', 'Marketing', 'Salaries', 'Infrastructure', 'Software & Tools',
    'Legal & Compliance', 'Office Supplies', 'Utilities', 'Travel',
    'Professional Services', 'Maintenance', 'Taxes', 'Insurance', 'Refund', 'Payout', 'Other'
  ];

  const paymentMethods = ['Bank Transfer', 'Cash', 'Card', 'Cheque', 'Online Payment', 'Other'];
  const paymentStatuses = ['pending', 'paid', 'partially_paid', 'cancelled', 'refunded'];

  const downloadExpensesReport = async () => {
    try {
      setDownloading(true);
      const response = await adminAPI.getExpenses({ page: 1, limit: 9999, ...filters });
      const allExpenses = response.data.expenses || [];

      const wb = XLSX.utils.book_new();
      const now = new Date();

      // Summary block at top
      const summaryBlock = [
        ['HolidaySri - Expenses Report'],
        ['Generated On:', now.toLocaleString()],
        ['Total Records:', allExpenses.length],
        ['Filters Applied:',
          [
            filters.search ? `Search: "${filters.search}"` : '',
            filters.expenseType !== 'all' ? `Type: ${filters.expenseType}` : '',
            filters.paymentStatus !== 'all' ? `Status: ${filters.paymentStatus}` : '',
            filters.paymentMethod !== 'all' ? `Method: ${filters.paymentMethod}` : '',
            filters.startDate ? `From: ${filters.startDate}` : '',
            filters.endDate ? `To: ${filters.endDate}` : '',
          ].filter(Boolean).join(' | ') || 'None'
        ],
        [],
      ];

      const header = [
        'Payment Date', 'Vendor Name', 'Vendor Email', 'Description',
        'Expense Type', 'Category', 'Payment Method', 'Payment Status',
        'Amount (LKR)', 'Tax Amount (LKR)', 'Tax %',
        'Transaction ID', 'Invoice No', 'Receipt No',
        'Paid By', 'Approved By', 'Department', 'Notes'
      ];
      const rows = allExpenses.map((e) => [
        formatDate(e.paymentDate),
        e.vendorName || '',
        e.vendorEmail || '',
        e.description || '',
        e.expenseType || '',
        e.category || '',
        e.paymentMethod || '',
        e.paymentStatus || '',
        e.amountLKR || 0,
        e.taxAmount || 0,
        e.taxPercentage || 0,
        e.transactionId || '',
        e.invoiceNumber || '',
        e.receiptNumber || '',
        e.paidBy || '',
        e.approvedBy || '',
        e.department || '',
        e.notes || ''
      ]);

      // Total row
      const totalExpenses = allExpenses.reduce((sum, e) => sum + (e.amountLKR || 0), 0);
      const totalTax = allExpenses.reduce((sum, e) => sum + (e.taxAmount || 0), 0);
      const totalRow = ['', '', '', '', '', '', '', 'TOTAL (LKR)', totalExpenses, totalTax, '', '', '', '', '', '', '', ''];

      const ws = XLSX.utils.aoa_to_sheet([...summaryBlock, header, ...rows, [], totalRow]);
      ws['!cols'] = [
        { wch: 22 }, { wch: 20 }, { wch: 28 }, { wch: 35 },
        { wch: 18 }, { wch: 18 }, { wch: 16 }, { wch: 16 },
        { wch: 16 }, { wch: 16 }, { wch: 10 },
        { wch: 18 }, { wch: 16 }, { wch: 16 },
        { wch: 16 }, { wch: 16 }, { wch: 16 }, { wch: 30 }
      ];
      XLSX.utils.book_append_sheet(wb, ws, 'Expenses');

      const dateStr = now.toISOString().split('T')[0];
      XLSX.writeFile(wb, `HolidaySri_Expenses_Report_${dateStr}.xlsx`);
    } catch (error) {
      console.error('Error generating expenses report:', error);
      alert('Failed to generate Expenses report. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header: title + action buttons */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Company Expenses
        </h3>
        <div className="flex items-center gap-3">
          <button
            onClick={downloadExpensesReport}
            disabled={downloading}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed text-white rounded-lg font-medium text-sm transition-colors shadow-sm"
            title="Download current Expenses records as Excel"
          >
            <FileSpreadsheet className="w-4 h-4" />
            {downloading ? 'Generating...' : 'Download Expenses XL'}
          </button>
          <button
            onClick={() => {
              setShowExpenseForm(true);
              setEditingExpense(null);
              resetExpenseForm();
            }}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Expense
          </button>
        </div>
      </div>

      {/* Expense Form Modal */}
      {showExpenseForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {editingExpense ? 'Edit Expense' : 'Add New Expense'}
              </h3>
              <button
                onClick={() => {
                  setShowExpenseForm(false);
                  setEditingExpense(null);
                  resetExpenseForm();
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Expense Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Expense Type *
                  </label>
                  <select
                    value={expenseForm.expenseType}
                    onChange={(e) => setExpenseForm({ ...expenseForm, expenseType: e.target.value })}
                    className="input"
                    required
                  >
                    {expenseTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category *
                  </label>
                  <input
                    type="text"
                    value={expenseForm.category}
                    onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                    className="input"
                    placeholder="e.g., Server Hosting, Employee Salary"
                    required
                  />
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Amount (LKR) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={expenseForm.amountLKR}
                    onChange={(e) => setExpenseForm({ ...expenseForm, amountLKR: e.target.value })}
                    className="input"
                    placeholder="0.00"
                    required
                  />
                </div>

                {/* Vendor Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Vendor/Payee Name *
                  </label>
                  <input
                    type="text"
                    value={expenseForm.vendorName}
                    onChange={(e) => setExpenseForm({ ...expenseForm, vendorName: e.target.value })}
                    className="input"
                    placeholder="Vendor name"
                    required
                  />
                </div>

                {/* Vendor Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Vendor Email
                  </label>
                  <input
                    type="email"
                    value={expenseForm.vendorEmail}
                    onChange={(e) => setExpenseForm({ ...expenseForm, vendorEmail: e.target.value })}
                    className="input"
                    placeholder="vendor@example.com"
                  />
                </div>

                {/* Vendor Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Vendor Phone
                  </label>
                  <input
                    type="tel"
                    value={expenseForm.vendorPhone}
                    onChange={(e) => setExpenseForm({ ...expenseForm, vendorPhone: e.target.value })}
                    className="input"
                    placeholder="+94 XX XXX XXXX"
                  />
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Payment Method *
                  </label>
                  <select
                    value={expenseForm.paymentMethod}
                    onChange={(e) => setExpenseForm({ ...expenseForm, paymentMethod: e.target.value })}
                    className="input"
                    required
                  >
                    {paymentMethods.map(method => (
                      <option key={method} value={method}>{method}</option>
                    ))}
                  </select>
                </div>

                {/* Payment Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Payment Status *
                  </label>
                  <select
                    value={expenseForm.paymentStatus}
                    onChange={(e) => setExpenseForm({ ...expenseForm, paymentStatus: e.target.value })}
                    className="input"
                    required
                  >
                    {paymentStatuses.map(status => (
                      <option key={status} value={status}>{status.replace('_', ' ').toUpperCase()}</option>
                    ))}
                  </select>
                </div>

                {/* Payment Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Payment Date *
                  </label>
                  <input
                    type="date"
                    value={expenseForm.paymentDate}
                    onChange={(e) => setExpenseForm({ ...expenseForm, paymentDate: e.target.value })}
                    className="input"
                    required
                  />
                </div>

                {/* Transaction ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Transaction ID
                  </label>
                  <input
                    type="text"
                    value={expenseForm.transactionId}
                    onChange={(e) => setExpenseForm({ ...expenseForm, transactionId: e.target.value })}
                    className="input"
                    placeholder="TXN123456"
                  />
                </div>

                {/* Invoice Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Invoice Number
                  </label>
                  <input
                    type="text"
                    value={expenseForm.invoiceNumber}
                    onChange={(e) => setExpenseForm({ ...expenseForm, invoiceNumber: e.target.value })}
                    className="input"
                    placeholder="INV-2024-001"
                  />
                </div>

                {/* Receipt Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Receipt Number
                  </label>
                  <input
                    type="text"
                    value={expenseForm.receiptNumber}
                    onChange={(e) => setExpenseForm({ ...expenseForm, receiptNumber: e.target.value })}
                    className="input"
                    placeholder="RCP-2024-001"
                  />
                </div>

                {/* Paid By */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Paid By
                  </label>
                  <input
                    type="text"
                    value={expenseForm.paidBy}
                    onChange={(e) => setExpenseForm({ ...expenseForm, paidBy: e.target.value })}
                    className="input"
                    placeholder="Admin name"
                  />
                </div>

                {/* Approved By */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Approved By
                  </label>
                  <input
                    type="text"
                    value={expenseForm.approvedBy}
                    onChange={(e) => setExpenseForm({ ...expenseForm, approvedBy: e.target.value })}
                    className="input"
                    placeholder="Manager name"
                  />
                </div>

                {/* Department */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Department
                  </label>
                  <input
                    type="text"
                    value={expenseForm.department}
                    onChange={(e) => setExpenseForm({ ...expenseForm, department: e.target.value })}
                    className="input"
                    placeholder="IT, HR, Finance, etc."
                  />
                </div>

                {/* Tax Percentage */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tax Percentage (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={expenseForm.taxPercentage}
                    onChange={(e) => setExpenseForm({ ...expenseForm, taxPercentage: e.target.value })}
                    className="input"
                    placeholder="0.00"
                  />
                </div>

                {/* Tax Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tax Amount (LKR)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={expenseForm.taxAmount}
                    onChange={(e) => setExpenseForm({ ...expenseForm, taxAmount: e.target.value })}
                    className="input"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description *
                </label>
                <textarea
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                  className="input"
                  rows="3"
                  placeholder="Detailed description of the expense"
                  required
                />
              </div>

              {/* Vendor Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Vendor Address
                </label>
                <textarea
                  value={expenseForm.vendorAddress}
                  onChange={(e) => setExpenseForm({ ...expenseForm, vendorAddress: e.target.value })}
                  className="input"
                  rows="2"
                  placeholder="Vendor address"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notes
                </label>
                <textarea
                  value={expenseForm.notes}
                  onChange={(e) => setExpenseForm({ ...expenseForm, notes: e.target.value })}
                  className="input"
                  rows="2"
                  placeholder="Additional notes"
                />
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => {
                    setShowExpenseForm(false);
                    setEditingExpense(null);
                    resetExpenseForm();
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Saving...' : editingExpense ? 'Update Expense' : 'Create Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Search
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              placeholder="Search expenses..."
              className="input pl-10"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Expense Type
          </label>
          <select
            value={filters.expenseType}
            onChange={(e) => setFilters({ ...filters, expenseType: e.target.value })}
            className="input"
          >
            <option value="all">All Types</option>
            {expenseTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Payment Status
          </label>
          <select
            value={filters.paymentStatus}
            onChange={(e) => setFilters({ ...filters, paymentStatus: e.target.value })}
            className="input"
          >
            <option value="all">All Status</option>
            {paymentStatuses.map(status => (
              <option key={status} value={status}>{status.replace('_', ' ').toUpperCase()}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Payment Method
          </label>
          <select
            value={filters.paymentMethod}
            onChange={(e) => setFilters({ ...filters, paymentMethod: e.target.value })}
            className="input"
          >
            <option value="all">All Methods</option>
            {paymentMethods.map(method => (
              <option key={method} value={method}>{method}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Start Date
          </label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            className="input"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            End Date
          </label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            className="input"
          />
        </div>
      </div>

      {/* Expenses Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Vendor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Payment Method
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Amount (LKR)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {loading ? (
              <tr>
                <td colSpan="8" className="px-6 py-12 text-center">
                  <div className="flex justify-center">
                    <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                  </div>
                </td>
              </tr>
            ) : expenses.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                  No expenses found
                </td>
              </tr>
            ) : (
              expenses.map((expense) => (
                <tr key={expense._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {formatDate(expense.paymentDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {expense.vendorName}
                    </div>
                    {expense.vendorEmail && (
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {expense.vendorEmail}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white max-w-xs truncate">
                    {expense.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {expense.expenseType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {expense.paymentMethod}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-red-600 dark:text-red-400">
                    {formatCurrency(expense.amountLKR)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      expense.paymentStatus === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                      expense.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      expense.paymentStatus === 'partially_paid' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                    }`}>
                      {expense.paymentStatus.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditExpense(expense)}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteExpense(expense._id)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing {((pagination.current - 1) * pagination.limit) + 1} to {Math.min(pagination.current * pagination.limit, pagination.total)} of {pagination.total} results
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPagination({ ...pagination, current: pagination.current - 1 })}
              disabled={pagination.current === 1}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setPagination({ ...pagination, current: pagination.current + 1 })}
              disabled={pagination.current === pagination.pages}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MoneyTransactions;

