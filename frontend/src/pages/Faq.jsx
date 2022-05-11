import React from 'react'
import { AccordionItem,Accordion,AccordionHeader } from 'reactstrap';
function Faq() {
  return (
    <div style={{ margin: "10px" }}>
      <Accordion>
        <AccordionItem>
          <AccordionHeader>
            <strong> What we do? </strong>
          </AccordionHeader>
          <AccordionItem style={{ margin: "10px" }}>
            We have developed a decentralized insurance platform where you pay
            by location, and get super-fast relief funds when you're hit by
            natural disasters such as a cyclone or a hurricane.
          </AccordionItem>
        </AccordionItem>
        <AccordionItem>
          <AccordionHeader>
            <strong> Problems with Traditional Insurance </strong>
          </AccordionHeader>
          <AccordionItem style={{ margin: "10px" }}>
            <li>
              Insurance companies do calculate periodic premiums based on the
              risk assessment of the parties they insure, those premiums also
              include a host of expenses, such as document processing, paper
              work, fees, employee wages and other administrative costs
              associated with a traditional financial system.
            </li>

            <br></br>
            <li>
              Centralization also presents a problem of selection bias, which is
              especially common in the insurance world. Not everyone can get the
              coverage they need and not everyone who has an insured loss gets
              paid. This is because insurance-providers need data to understand
              risks and pay claims, and enough risk pools to cover costs.
            </li>
            <br></br>
            <li>
              A premium is basically a fixed periodic price that the user is
              expected to pay regularly upfront
            </li>
            <br></br>
            <li>No dynamic premium for disasters</li>
          </AccordionItem>
        </AccordionItem>
        <AccordionItem>
          <AccordionHeader>
            <strong>Problems with Centralized Insurance</strong>
          </AccordionHeader>
          <AccordionItem style={{ margin: "10px" }}>
            In centralized insurance, the resources are “pooled” centrally with
            an insurer. This central company:
            <li>Assesses the risk </li>
            <li>Determines the premium </li>
            <li>Determines when the liability is realized</li>
            <li>Assesses the damage</li>
            <li>And eventually offers the payment to the insured</li>
          </AccordionItem>
        </AccordionItem>
        <AccordionItem>
          <AccordionHeader>
            <strong>How decentralization comes into play</strong>
          </AccordionHeader>
          <AccordionItem style={{ margin: "10px" }}>
            The key to anything decentralized is, as we’ve said before,
            ‘disintermediation.’ This refers to the replacement of inefficient
            middleman with efficient, effective, and transparent programs. On
            the same principle, decentralized insurances can replace some of the
            functions with code, which will allow for greater efficiency and
            participation.
          </AccordionItem>
        </AccordionItem>
        <AccordionItem>
          <AccordionHeader>
            <strong> Ensure Future</strong>
          </AccordionHeader>
          <AccordionItem style={{ margin: "10px" }}>
            Decentralized insurance is key to the larger decentralized finance
            space. Through it, a robust foundation for the new digital economy
            will be built, on the back of decentralized currency and blockchain
            technology. Nothing can guarantee that we’ll all live long and
            prosper but insurance can guarantee the latter at least.
          </AccordionItem>
        </AccordionItem>
      </Accordion>

      <p style={{ marginLeft: "45%",  marginTop: "55px" }}>
        Made with ❤️ by Team InstaSafe
      </p>
    </div>
  );
}

export default Faq
