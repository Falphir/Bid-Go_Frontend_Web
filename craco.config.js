// craco.config.js
module.exports = {
    babel: {
        plugins: [
            ...(process.env.COVERAGE === 'true'
                ? ['istanbul']
                : []),
        ],
    },
};