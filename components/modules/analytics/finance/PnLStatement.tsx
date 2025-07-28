import React from 'react';
import { Icons } from '../../../icons';
import '../shared.css';
import './PnLStatement.css';

const pnlData = {
    "This Quarter": { revenue: 550000, cogs: 50000, marketing: 20000, salaries: 250000, operations: 80000 },
    "Last Quarter": { revenue: 520000, cogs: 48000, marketing: 22000, salaries: 245000, operations: 78000 },
};

const PnLStatement: React.FC = () => {
    const calculateMetrics = (data) => {
        const grossProfit = data.revenue - data.cogs;
        const operatingExpenses = data.marketing + data.salaries + data.operations;
        const netIncome = grossProfit - operatingExpenses;
        return { grossProfit, operatingExpenses, netIncome };
    };

    const thisQuarterMetrics = calculateMetrics(pnlData["This Quarter"]);
    const lastQuarterMetrics = calculateMetrics(pnlData["Last Quarter"]);

  return (
    <div className="analytics-content-pane">
        <div className="analytics-widget">
            <h3 className="analytics-widget-title"><Icons.FileText size={20} /> Profit & Loss Statement</h3>
             <div className="analytics-table-container">
                <table className="analytics-table pnl-table">
                    <thead>
                        <tr>
                            <th>Metric</th>
                            <th>This Quarter</th>
                            <th>Last Quarter</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="section-header"><td colSpan={3}>Revenue</td></tr>
                        <tr><td>Total Revenue</td><td>${pnlData["This Quarter"].revenue.toLocaleString()}</td><td>${pnlData["Last Quarter"].revenue.toLocaleString()}</td></tr>
                        <tr><td>Cost of Goods Sold</td><td>(${pnlData["This Quarter"].cogs.toLocaleString()})</td><td>(${pnlData["Last Quarter"].cogs.toLocaleString()})</td></tr>
                        <tr className="summary-row"><td>Gross Profit</td><td>${thisQuarterMetrics.grossProfit.toLocaleString()}</td><td>${lastQuarterMetrics.grossProfit.toLocaleString()}</td></tr>
                        
                        <tr className="section-header"><td colSpan={3}>Operating Expenses</td></tr>
                        <tr><td>Marketing</td><td>(${pnlData["This Quarter"].marketing.toLocaleString()})</td><td>(${pnlData["Last Quarter"].marketing.toLocaleString()})</td></tr>
                        <tr><td>Salaries & Benefits</td><td>(${pnlData["This Quarter"].salaries.toLocaleString()})</td><td>(${pnlData["Last Quarter"].salaries.toLocaleString()})</td></tr>
                        <tr><td>Operations</td><td>(${pnlData["This Quarter"].operations.toLocaleString()})</td><td>(${pnlData["Last Quarter"].operations.toLocaleString()})</td></tr>
                        <tr className="summary-row"><td>Total Operating Expenses</td><td>(${thisQuarterMetrics.operatingExpenses.toLocaleString()})</td><td>(${lastQuarterMetrics.operatingExpenses.toLocaleString()})</td></tr>
                        
                        <tr className="net-income-row">
                            <td>Net Income</td>
                            <td>${thisQuarterMetrics.netIncome.toLocaleString()}</td>
                            <td>${lastQuarterMetrics.netIncome.toLocaleString()}</td>
                        </tr>
                    </tbody>
                </table>
             </div>
        </div>
    </div>
  );
};

export default PnLStatement;
