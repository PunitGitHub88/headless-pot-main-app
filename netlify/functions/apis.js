
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

exports.handler = async (event, context) => {
  const { path, queryStringParameters, httpMethod, headers, body } = event;
  const basePath = '/.netlify/functions/apis'; // Adjust this based on your setup
  const apiPath = path.replace(basePath, '');
  const queryString = new URLSearchParams(queryStringParameters).toString();
  const fullUrl = `${apiPath}${queryString ? '?' + queryString : ''}`;
   // Get cookies from the headers
   const cookies = event.headers.cookie ? parseCookies(event.headers.cookie) : {};
   // Access specific cookies
   const token = cookies["2391-token"] || "ewogICJ0eXAiIDogIkpXVCIsCiAgImFsZyIgOiAiUlMyNTYiCn0.ewogICJkb21haW4iIDogIjIzOTEiLAogICJhcHBJZCIgOiAiMjM5IiwKICAiaXNzIiA6ICJidWlsZGluZ3NidC5zdGFnZS5ob25leXdlbGwuY29tIiwKICAianRpIiA6ICI4Y2FhZGUxYi0zNjk5LTRkNjgtYTMwZS1iNTYyZGQ0ZTM0NTIiLAogICJzdWIiIDogIjQyZDdkZmM4LWQ5ZmQtNGMyOS1iZTE2LWFkODU0ZGE5MTdiNiIsCiAgImlhdCIgOiAxNzIyMzI1NjQ1LAogICJleHAiIDogMTcyMjMyNzQ0NQp9.VQJkBE1nXUOlW-n384j-585rmS-Sm3lEtD9lGpuc6La0jgr8nXwbtK68Yw7UH0m5ZQhuzFwlkdlkPL3TXCL7j_In9xEX5G1sUoe576LFtxX2IuVLLzsQPk3YpfLitofXRemeAKpHGqkPWoUb_Xrd_8eoRcT1fYQYvn0AFjVPXC6_KYE_A9n4vohtkL2G5K57L4VkM8TUgW_26qj37oPqwSdE8RCdTaHxLbms5Bf0Et_kiQimpcurKFDBAHoNjRcBmtRwY_tY3wJoKTOW86wnF-rOXzHzVW_mZOc1EkFYZd3QltNpGTXlyJOTZzPTrDhifb7rMIqEw7f1i1Sxn81GqQ";

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
      let requestData ; 
      if (typeof body === 'string') {
        try {
          requestData = JSON.parse(body);
        } catch (error) {
          console.error('Invalid JSON string:', body);
          requestData = {};
        }
      } else {
        requestData = body || {};
      }// Assuming the request body is JSON

      try {
        // Make an external API POST call
        const response = await fetch(targetURL, {
          method: httpMethod,
          headers: {
            'Authorization': "Bearer " + token,
            'Cookie': cookieVal
          },
          json: JSON.stringify(requestData),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        // Handle the response data
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