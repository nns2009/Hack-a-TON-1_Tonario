import { Link } from "react-router-dom";

function ShareSuccess() {
  return <div>
	Shared successfully. <br />
	<Link to='/share'>Post more</Link> <br />
	<Link to='/feed'>Browse</Link>
  </div>
}

export default ShareSuccess;
