// if you don't pass in req, it works client-side only
export function getSubdomain(req) {
  let host
  let sub
  if (req && req.headers.host) {
    host = req.headers.host
  }
  if (typeof window !== "undefined") {
    host = window.location.host
  }
  if (host) {
    sub = host.split("localhost:3000")[0]
    if (sub) {
      return sub.split(".")[0]
    }
  }
}

export default getSubdomain;
