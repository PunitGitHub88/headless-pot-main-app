// Utility function to parse cookies
const parseCookies = (cookieString) => {
  return cookieString
    .split(';')
    .map(cookie => cookie.trim())
    .reduce((acc, cookie) => {
      const [key, value] = cookie.split('=');
      acc[key] = value;
      return acc;
    }, {});
};

const generateApigeeToken = async () => {
  const APIGEE_AUTH_URL = 'https://api.ciq3kgmonc-honeywell1-d3-public.model-t.cc.commerce.ondemand.com/authorizationserver/oauth/token';
  const CLIENT_ID = 'asm';
  const CLIENT_SECRET = '1234';
  const response = await fetch(APIGEE_AUTH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      'grant_type': 'client_credentials',
      'client_id': CLIENT_ID,
      'client_secret': CLIENT_SECRET
    })
  });

  if (!response.ok) {
    throw new Error(`Failed to generate Apigee token: ${response.statusText}`);
  }

  const data = await response.json();
  return data.access_token;
};

exports.handler = async (event, context) => {
  const { path, queryStringParameters, httpMethod, headers, body } = event;
  const basePath = '/.netlify/functions/apis'; // Adjust this based on your setup
  const apiPath = path.replace(basePath, '');
  const queryString = new URLSearchParams(queryStringParameters).toString();
  const fullUrl = `${apiPath}${queryString ? '?' + queryString : ''}`;

  // Get cookies from the headers
  const cookies = headers.cookie ? parseCookies(headers.cookie) : {};
  // Access specific cookies
  const token = cookies["2391-token"] || "ewogICJ0eXAiIDogIkpXVCIsCiAgImFsZyIgOiAiUlMyNTYiCn0.ewogICJkb21haW4iIDogIjIzOTEiLAogICJhcHBJZCIgOiAiMjM5IiwKICAiaXNzIiA6ICJidWlsZGluZ3NidC5zdGFnZS5ob25leXdlbGwuY29tIiwKICAianRpIiA6ICI1NTU5ZDY5MC1mMjE4LTRkZDAtOWY1Zi1hYzI3ZmJhYWVhNTUiLAogICJzdWIiIDogImVjYjQ1NmFlLWU0ZjUtNDYzMC1iYWMzLWE4YjFhYTQ2ZmRmNyIsCiAgImlhdCIgOiAxNzIzMTIwNDc3LAogICJleHAiIDogMTcyMzEyMjI3Nwp9.VnX4kDIIOv9-OTnU4qE-QvwZI7v3q7hH6diNk4GjjCFf6mEAyVnfIH2HSeFOcMROAEMLqqobgIA46yIpBWBRdlYgfOEdvSTs0YYR9cuqwjqF9i9k1A7aOr7zXIGLwtwV8YqezRYhl0je7pfepJ_pw_Tn-2W63xhQ61O5jpuwa7Sx2yNorL9LhcciO9MxVElQ4B3hBLdsni6b33qu9DoOiYLrSbZxMjOseKmw-rNYuclwNjy1GtJQsaTbo7boAd7nwTci6GoosewqPucfOtZnc8BONVVWwiG83dy7urYLpzqgu5TgHL62rdqsV1rC0QTWJdylkFUY4JKwTMLyUXhqfA";

  if (apiPath.includes("/pif/")) {
    if (httpMethod === 'OPTIONS') {
      // CORS Preflight
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        },
        body: ''
      };
    } else {
      const targetURL = "https://buildingsbt.stage.honeywell.com" + fullUrl;
      const cookieVal = "2391-token=" + token;
      let requestData = {};

      if (httpMethod !== 'GET' && httpMethod !== 'HEAD' && body) {
        if (typeof body === 'string') {
          try {
            requestData = JSON.parse(body);
          } catch (error) {
            console.error('Invalid JSON string:', body);
          }
        } else {
          requestData = body;
        }
      }

      try {
        let config_call =  {
          method: httpMethod,
          headers: {
            'Authorization': "Bearer " + token,
            'Cookie': cookieVal
          },
        } 

        if (httpMethod !== 'GET') {
           config_call =  {
            method: httpMethod,
            headers: {
              'Authorization': "Bearer " + token,
              'Cookie': cookieVal
            },
            body: JSON.stringify(requestData)
          } 
        }

        console.log('Target URL:', targetURL,  'Config:', config_call)
        const response = await fetch(targetURL, config_call);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Response data:', data);

        return {
          statusCode: 200,
          headers: {
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify(data)
        };

      } catch (error) {
        console.error('Fetch error:', error);
        return {
          statusCode: 500,
          headers: {
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({ message: 'Internal Server Error', error: error.message })
        };
      }
    }
  } else if (apiPath.includes("/productDetails/")) {
    try {
      // Ensure apigee_token is defined
      const apigee_token = await generateApigeeToken();

      // New API handling logic
      const targetURL = `https://api.ciq3kgmonc-honeywell1-d3-public.model-t.cc.commerce.ondemand.com/honeywellwebservices/v2/honeywell${apiPath}${queryString ? '?' + queryString : ''}`;

      console.log('Target URL:', targetURL, 'Apigee Token:', apigee_token);

      const response = await fetch(targetURL, {
        method: httpMethod,
        headers: {
          'Authorization': "Bearer " + apigee_token,
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Response data:', data);

      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify(data)
      };

    } catch (error) {
      console.error('Fetch error:', error);
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ message: 'Internal Server Error', error: error.message })
      };
    }
  } else {
    return {
      statusCode: 404,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ message: 'Not Found' })
    };
  }
};
