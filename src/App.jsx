import { createClient } from "graphql-ws";
import { useState } from "react";
import "./taildwind-3.0.24.min.css";

function App() {
  const [message, setMessage] = useState("");
  const [helloSaid, setHelloSaid] = useState(null);

  const client = createClient({
    url: "ws://localhost:3000/graphql",
  });

  const sayHelloQuery = async () => {
    await new Promise((resolve, reject) => {
      let result;
      const query = message
        ? `
        query($messageInput: MessageInput!) { 
          sayHello(messageInput: $messageInput) 
        }`
        : `
        query{ 
          sayHello 
        }`;

      client.subscribe(
        {
          query,
          variables: {
            messageInput: { content: message },
          },
        },
        {
          next: (data) => {
            result = data;
            console.log(data);
          },
          error: (error) => {
            reject(error);
          },
          complete: () => {
            resolve(result);
          },
        }
      );
    });
  };

  const subscribe = async () => {
    let result, unsubscribe;

    await new Promise((resolve, reject) => {
      unsubscribe = client.subscribe(
        {
          query: "subscription { helloSaid { message } }",
        },
        {
          next: (data) => {
            result = data;
            setHelloSaid(data);
            console.log(data);
          },
          error: (error) => {
            console.log(error);
            reject(error);
          },
          complete: () => {
            console.log("subscription complete ");
            unsubscribe();
            resolve(result);
          },
        }
      );
    });
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 flex-col items-center lg:justify-between">
      <h1 className="text-lg  text-center mb-10 md:text-left">
        GraphQL-WS Client
      </h1>
      <form onSubmit={(e) => e.preventDefault()}>
        <label htmlFor="message">Input your message :</label>
        <input
          className="bg-gray-100 px-2 py-1 mx-2 rounded-lg placeholder:italic placeholder:text-slate-40 focus:outline-none focus:ring focus:border-blue-500"
          type="text"
          name="message"
          id="message"
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
          }}
        />
        <button
          className="bg-indigo-200 rounded-lg text-gray-700 font-normal-500 text-sm p-1"
          onClick={sayHelloQuery}
        >
          sayHello
        </button>
      </form>

      <div className="mt-4">
        <button
          className="bg-blue-200 rounded-lg text-gray-700 font-normal-500 text-sm p-1"
          onClick={subscribe}
        >
          Subscribe the message
        </button>

        <div>
          {helloSaid
            ? helloSaid.data.helloSaid.message
            : "No message has been sent."}
        </div>
      </div>
    </div>
  );
}

export default App;
