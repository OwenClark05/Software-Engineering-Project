import { useState } from "react";

function App() {
    const name: string[] = ["Alex","Same","John"];
    const password: string[] = ["1234","abcd","password"];
    // State for entered username and password
    const[enteredName, setEnteredName] = useState<string>("");
    const[enteredPassword, setEnteredPassword] = useState<string>("");
    // Functions to check if entered username and password exist
    function enteredNameExists() {
        return name.includes(enteredName);
    }

    function enteredPasswordExists() {
        return password.includes(enteredPassword);
    }

    return (
        <main>
         <h1><center>5 Guys Coding</center></h1>           
         <center><img src="https://ih1.redbubble.net/image.2000986734.3760/raf,360x360,075,t,fafafa:ca443f4786.jpg" alt="Logo" /></center>
            <p><center>Please enter your username</center></p>
            {/*Username Information*/}
            {/* the place holder title need to be replace one those methodes have been created with datad base  */}
            <center><input type="Username" value={enteredName} onChange={(e) => setEnteredName(e.target.value)} placeholder="Enter your name" /></center>
           
            <p><center>Please enter your password</center></p>
            {/*Password Information*/}
            <center><input type="Password" value={enteredPassword} onChange={(e) => setEnteredPassword(e.target.value)}  placeholder="Enter your password" /></center>
            <br />
            <center><button
             onClick={() => {
                if (enteredNameExists() && enteredPasswordExists()) {
                    alert("Login successful");
                } else {
                    alert("Invalid username or password");
                }
            }}>
            Submit</button></center>
            <br />
            <p><center>Make a account</center></p>
            <center><button>Create Account</button></center>

        </main>
    );
}

export default App;