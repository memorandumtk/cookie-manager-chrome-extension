import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

/**
 * Component for the cookie chart.
 * @param data
 * @returns {Element}
 * @constructor
 */
const CookieChart = ({ data }) => {
    const chartData = {
        labels: Object.keys(data),
        datasets: [
            {
                label: 'Cookies',
                data: Object.values(data),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)',
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)',
                ],
                borderWidth: 1,
            },
        ],
    };

    const chartOptions = {
        plugins: {
            legend: {
                labels: {
                    color: 'white', // Change this to your desired color
                },
            },
        },
    };

    return <Doughnut data={chartData} options={chartOptions} />;
};

export default CookieChart;
