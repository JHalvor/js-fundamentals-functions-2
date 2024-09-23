// HERE ARE SOME EXAMPLES OF RAW HTTP REQUESTS (text)
// WE ARE GOING TO WRITE A COLLECTION OF FUNCTIONS THAT PARSE THE HTTP REQUEST
// AND CONVERTS IT ALL INTO A Javascript object

// EXAMPLE INPUT 1
const rawGETRequest = `
GET / HTTP/1.1
Host: www.example.com
`
// OUTPUT
const request = {
  method: 'GET',
  path: '/',
  headers: {
    Host: 'www.example.com'
  },
  body: null,
  query: null
}
// EXAMPLE 2
const rawGETRequestComplex = `
GET /api/data/123?someValue=example HTTP/1.1
Host: www.example.com
Authorization: Bearer your_access_token
`
const requestComplex = {
  method: 'GET',
  path: '/api/data/123',
  headers: {
    Host: 'www.example.com',
    Authorization: 'Bearer your_access_token'
  },
  body: null,
  query: {
    someValue: 'example'
  }
}
// EXAMPLE 3: NOTE the BODY is separated from the HEADERS via an empty line
const rawPOSTRequest = `
POST /api/data HTTP/1.1
Host: www.example.com
Content-Type: application/json
Content-Length: 36

{"key1": "value1", "key2": "value2"}
`
const requestPOST = {
  method: 'POST',
  path: '/api/data',
  headers: {
    Host: 'www.example.com',
    'Content-Type': 'application/json',
    'Content-Length': '36'
  },
  body: {
    key1: 'value1',
    key2: 'value2'
  },
  query: null
}

// IMPLEMENTATION
// WE WILL provide different tests for the different functions

// 1. Create a function named parseRequest that accepts one parameter:
// - the raw HTTP request string
// It must return an object with the following properties:
// - method: the HTTP method used in the request
// - path: the path in the request
// - headers: an object with the headers in the request
// - body: the body in the request
// - query: an object with the query parameters in the request
function parseRequest(req) {
  const request = {
    method: '',
    path: '',
    headers: {},
    body: null,
    query: null
  }
  // call the other functions below as needed
  request.method = req.substring(0, req.indexOf(' ')).trim()
  const path = req.substring(
    req.indexOf(' ') + 1,
    req.indexOf(' ', req.indexOf(' ') + 1)
  )

  if (path.indexOf('?') === -1) {
    request.path = path
  } else {
    request.path = path.substring(0, path.indexOf('?'))
  }

  req = req.substring(req.indexOf('\n'))

  let headers = ''
  if (req.includes('{')) {
    headers = req.substring(req.indexOf('\n'), req.indexOf('\n\n')).split('\n')
  } else {
    headers = req.substring(req.indexOf('\n')).split('\n')
  }
  headers.forEach((element) => {
    request.headers = parseHeader(element, request.headers)
  })

  const body = req.substring(req.indexOf('{'), req.indexOf('}') + 1)
  request.body = parseBody(body)

  request.query = extractQuery(path)
  return request
}

// 2. Create a function named parseHeader that accepts two parameters:
// - a string for one header, and an object of current headers that must be augmented with the parsed header
// it doesnt return nothing, but updates the header object with the parsed header
// eg: parseHeader('Host: www.example.com', {})
//        => { Host: 'www.example.com' }
// eg: parseHeader('Authorization: Bearer your_access_token', { Host: 'www.example.com' })
//        => { Host: 'www.example.com', Authorization: 'Bearer your_access_token'}
// eg: parseHeader('', { Host: 'www.example.com' }) => { Host: 'www.example.com' }
function parseHeader(header, headers) {
  const headerName = header.substring(0, header.indexOf(':')).trim()
  const headerContent = header.substring(header.indexOf(':') + 1).trim()
  if (headerName.length === 0 || headerName.length === 0) {
    return headers
  }
  headers[headerName] = headerContent
  return headers
}

// 3. Create a function named parseBody that accepts one parameter:
// - a string for the body
// It must return the parsed body as a JavaScript object
// search for JSON parsing
// eg: parseBody('{"key1": "value1", "key2": "value2"}') => { key1: 'value1', key2: 'value2' }
// eg: parseBody('') => null
function parseBody(body) {
  if (body === null || body.length === 0) {
    return null
  }
  const objBody = {}
  body = body
    .replaceAll('{', '')
    .replaceAll('}', '')
    .replaceAll('"', '')
    .replaceAll(' ', '')
    .trim()
    .split(',')
  body.forEach((element) => {
    const [key, value] = element.split(':')
    objBody[key] = value
  })
  return objBody
}

// 4. Create a function named extractQuery that accepts one parameter:
// - a string for the full path
// It must return the parsed query as a JavaScript object or null if no query ? is present
// eg: extractQuery('/api/data/123?someValue=example') => { someValue: 'example' }
// eg: extractQuery('/api/data/123') => null
function extractQuery(path) {
  if (!path.includes('?')) {
    return null
  }
  const newObj = {}
  path = path.substring(path.indexOf('?') + 1).split('&')
  path.forEach((element) => {
    const [key, value] = element.split('=')
    newObj[key] = value
  })
  return newObj
}

module.exports = {
  rawGETRequest,
  rawGETRequestComplex,
  rawPOSTRequest,
  request,
  requestComplex,
  requestPOST,
  parseRequest /* eslint-disable-line no-undef */,
  parseHeader /* eslint-disable-line no-undef */,
  parseBody /* eslint-disable-line no-undef */,
  extractQuery /* eslint-disable-line no-undef */
}
