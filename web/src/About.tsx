import React from "react";
import { Link } from "react-router-dom";

import styles from './About.module.scss';
import { CreditPost } from "./Post";



function Pair(params: { children: React.ReactNode }) {
  return <div className={styles.pair}>
    {params.children}
  </div>
}
function Question(params: { children: React.ReactNode }) {
  return <div className={styles.question}>
    {params.children}
  </div>
}
function Answer(params: { children: React.ReactNode }) {
  return <div className={styles.answer}>
    {params.children}
  </div>
}


function About() {
  console.log('about render', Date.now());
  
  return (
    <>
      <p>
        Info about OnlyGrams goes here
      </p>
      <h2>
        Faq
      </h2>
      <Pair>
        <Question>Can I pay with Bitcoin?</Question>
        <Answer>No</Answer>
      </Pair>
      <Pair>
        <Question>Can I use Ethereum on OnlyGrams.io?</Question>
        <Answer>No</Answer>
      </Pair>
      <Pair>
        <Question>Can I use newly released TON payment channels with OnlyGrams to save on transaction costs?</Question>
        <Answer>Yes</Answer>
      </Pair>
      <Pair>
        <Question>Is OnlyGrams evm compatible service?</Question>
        <Answer>Unfortunately Ethereum is not OnlyGrams-compatible now, but we hope they will fix this in the future</Answer>
      </Pair>
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
