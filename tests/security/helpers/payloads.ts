export const maliciousPayloads = {
  sqlInjection: "' OR '1'='1",
  xss: '<script>alert("sentinel")</script>',
  headerInjection: 'finance.manager@sentinel.local\r\nX-Injected: injected',
};
