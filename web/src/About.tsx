import { Link } from "react-router-dom";

function About() {
  console.log('about render', Date.now());

  return (
    <>
      <p>
        Info about TonoGram goes here
      </p>
      <div>
        Credits:
        <div>Igor Konyakhin</div>
        <div>Andrew Python</div> 
        <div>Nick Nekilov</div>
      </div>
    </>
  );
}

export default About;
