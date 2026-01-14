import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend } from 'k6/metrics';

const pageLoadTime = new Trend('page_load_time_ms');
const scenarioDuration = new Trend('scenario_duration_ms');

export const options = {
  vus: 5,
  duration: '1m',
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

function encodeForm(data) {
  return Object.entries(data)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
    )
    .join('&');
}

function registerUser() {
  const suffix = Date.now().toString();
  const username = `user_${suffix}`;
  const email = `user_${suffix}@example.com`;
  const password = `Passw0rd!${suffix}`;

  const res = http.post(
    `${BASE_URL}/api/auth/register`,
    JSON.stringify({ username, email, password }),
    { headers: { 'Content-Type': 'application/json' } }
  );

  check(res, {
    'register status is 200': (r) => r.status === 200,
  });

  return { username, password };
}

function getCsrfToken(jar) {
  const res = http.get(`${BASE_URL}/api/auth/csrf`, { jar });
  check(res, {
    'csrf token status is 200': (r) => r.status === 200,
    'csrf token exists': (r) => Boolean(r.json('csrfToken')),
  });
  return res.json('csrfToken');
}

function login(jar, creds) {
  const csrfToken = getCsrfToken(jar);
  const body = encodeForm({
    csrfToken,
    username: creds.username,
    password: creds.password,
    callbackUrl: `${BASE_URL}/`,
    json: 'true',
  });

  const res = http.post(`${BASE_URL}/api/auth/callback/credentials`, body, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    jar,
  });

  check(res, {
    'login status is 200 or 302': (r) => r.status === 200 || r.status === 302,
  });
}

function logout(jar) {
  const csrfToken = getCsrfToken(jar);
  const body = encodeForm({
    csrfToken,
    callbackUrl: `${BASE_URL}/`,
    json: 'true',
  });

  const res = http.post(`${BASE_URL}/api/auth/signout`, body, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    jar,
  });

  check(res, {
    'logout status is 200 or 302': (r) => r.status === 200 || r.status === 302,
  });
}

function listPosts(jar) {
  const res = http.get(`${BASE_URL}/api/posts`, { jar });
  check(res, {
    'posts list status is 200': (r) => r.status === 200,
  });
  return res;
}

function createPost(jar, label) {
  const payload = {
    title: `Load test post ${label}`,
    description: 'Created during k6 load testing',
    body: 'Post body for load testing',
  };

  const res = http.post(`${BASE_URL}/api/posts`, JSON.stringify(payload), {
    headers: { 'Content-Type': 'application/json' },
    jar,
  });

  check(res, {
    'post created status is 200': (r) => r.status === 200,
  });
  return res;
}

function ensurePosts(jar, count) {
  const res = listPosts(jar);
  let posts = [];
  try {
    posts = res.json();
  } catch (error) {
    posts = [];
  }

  if (!Array.isArray(posts)) {
    posts = [];
  }

  while (posts.length < count) {
    const created = createPost(jar, `${__VU}-${__ITER}-${posts.length}`);
    const createdId = created.json('post.id');
    if (createdId) {
      posts.push({ id: createdId });
    } else {
      break;
    }
  }

  return posts;
}

function viewPost(jar, postId) {
  const res = http.get(`${BASE_URL}/api/posts/${postId}`, { jar });
  check(res, {
    'post detail status is 200': (r) => r.status === 200,
  });
  return res;
}

function addComment(jar, postId) {
  const payload = { name: 'Load Tester', message: 'Nice post from k6!' };
  const res = http.post(
    `${BASE_URL}/api/posts/${postId}/comments`,
    JSON.stringify(payload),
    { headers: { 'Content-Type': 'application/json' }, jar }
  );

  check(res, {
    'comment created status is 200': (r) => r.status === 200,
  });
}

function viewPostScenario(jar) {
  const start = Date.now();
  const listRes = listPosts(jar);
  const posts = Array.isArray(listRes.json()) ? listRes.json() : [];

  if (posts.length === 0) {
    const created = createPost(jar, `${__VU}-${__ITER}-seed`);
    const createdId = created.json('post.id');
    if (createdId) {
      posts.push({ id: createdId });
    }
  }

  const postId = posts[0]?.id;
  if (postId) {
    const detailRes = viewPost(jar, postId);
    pageLoadTime.add(listRes.timings.duration + detailRes.timings.duration);
  }

  scenarioDuration.add(Date.now() - start, { scenario: 'view_post' });
}

function commentScenario(jar) {
  const start = Date.now();
  const posts = ensurePosts(jar, 2);

  const firstId = posts[0]?.id;
  const secondId = posts[1]?.id;

  if (firstId) {
    viewPost(jar, firstId);
  }

  if (secondId) {
    viewPost(jar, secondId);
    addComment(jar, secondId);
  }

  scenarioDuration.add(Date.now() - start, { scenario: 'comment' });
}

function createPostScenario(jar) {
  const start = Date.now();
  createPost(jar, `${__VU}-${__ITER}-new`);
  scenarioDuration.add(Date.now() - start, { scenario: 'create_post' });
}

function profileScenario(jar) {
  const start = Date.now();
  const profileRes = http.get(`${BASE_URL}/api/profile`, { jar });
  check(profileRes, {
    'profile get status is 200': (r) => r.status === 200,
  });

  const updatePayload = {
    firstName: 'Load',
    lastName: 'Tester',
    age: 22,
    gender: 'male',
    address: 'Sumy',
    website: 'https://example.com',
  };

  const updateRes = http.put(
    `${BASE_URL}/api/profile`,
    JSON.stringify(updatePayload),
    { headers: { 'Content-Type': 'application/json' }, jar }
  );

  check(updateRes, {
    'profile update status is 200': (r) => r.status === 200,
  });

  scenarioDuration.add(Date.now() - start, { scenario: 'profile' });
}

export function setup() {
  return registerUser();
}

export default function (creds) {
  const jar = http.cookieJar();

  login(jar, creds);

  const selector = (__ITER + __VU) % 4;
  if (selector === 0) {
    viewPostScenario(jar);
  } else if (selector === 1) {
    commentScenario(jar);
  } else if (selector === 2) {
    createPostScenario(jar);
  } else {
    profileScenario(jar);
  }

  logout(jar);
  sleep(1);
}
