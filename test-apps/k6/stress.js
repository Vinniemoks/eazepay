import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 50 },
    { duration: '5m', target: 200 },
    { duration: '3m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  const base = __ENV.API_BASE || 'http://localhost:8000';
  const res = http.get(`${base}/health`);
  check(res, {
    'status is 200': (r) => r.status === 200,
  });
  sleep(0.5);
}

