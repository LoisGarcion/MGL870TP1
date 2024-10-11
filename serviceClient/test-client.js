import http from 'k6/http';
import { check, sleep, fail } from 'k6';

export let options = {
    vus: 10,
    stages: [
        { duration: '30s', target: 10 },
        { duration: '1m', target: 10 },
        { duration: '30s', target: 0 },
    ],
    thresholds: {
        http_req_duration: ['p(95)<250'],
    },
};

export default function () {
    const res = http.get('http://serviceclient:8080/client/2');
    const checkOutput = check(res, {
        'status is 200': (r) => r.status === 200,
    });

    if (!checkOutput) {
        console.log('Error: status is not 200');
        // Optionally, fail the test if the check fails
        fail('Test failed due to unexpected status code');
    }

    sleep(1); // Add a small pause between iterations
}
