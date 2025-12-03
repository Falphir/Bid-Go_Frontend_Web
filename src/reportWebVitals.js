/**
 * Reports web vitals metrics.
 *
 * This helper can be used to log or send Core Web Vitals metrics to an
 * analytics endpoint. It is typically called from `index.js` with a
 * custom logging function.
 *
 * @param {function(Object): void} onPerfEntry -
 *   Callback invoked with each collected performance metric.
 */
// reportWebVitals permite recolher métricas de performance da aplicação
// usando a biblioteca 'web-vitals'. Se fornecer uma função em onPerfEntry
// (por exemplo, console.log ou envio para um endpoint), as métricas serão
// reportadas quando disponíveis.
//
// Métricas recolhidas:
// - CLS (Cumulative Layout Shift): estabilidade visual
// - FID (First Input Delay): latência à primeira interação
// - FCP (First Contentful Paint): tempo até primeiro conteúdo
// - LCP (Largest Contentful Paint): tempo até maior elemento visível
// - TTFB (Time To First Byte): tempo até o primeiro byte de resposta
const reportWebVitals = (onPerfEntry) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import("web-vitals").then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
    });
  }
};

export default reportWebVitals;
