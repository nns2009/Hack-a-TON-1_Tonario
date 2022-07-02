import { Link } from "react-router-dom";

import styles from './About.module.scss';
import { CreditPost } from "./Post";


function About() {
  console.log('about render', Date.now());
  
  return (
    <>
      <p>
        Info about OnlyGrams goes here
      </p>
      <h2>
        Credits
      </h2>
      <div className={styles.credits}>
        <CreditPost imageUrl="/CreditPhoto.png" title="Igor Konyakhin" text="Frontend magician" />
        <CreditPost imageUrl="/CreditPhoto.png" title="Andrew Python" text="Payment Channel guru" />
        <CreditPost imageUrl="/CreditPhoto.png" title="Nick Nekilov" text="Backend maker" />
      </div>
    </>
  );
}

export default About;
