process.env.SWC = "false";
process.env.REACT_APP_SWC = "false";

module.exports = {
    babel: {
        plugins: [
            ...(process.env.COVERAGE === 'true'
                ? ['istanbul']
                : []),
        ],
    },
};