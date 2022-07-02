import { Link } from "react-router-dom";

function NotFound() {
  return <div>
    Page not found, but you could browse <Link to='/feed'>feed</Link> instead:)
  </div>
}

export default NotFound;
