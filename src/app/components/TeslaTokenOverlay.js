"use client";

import { useState, useEffect, useLayoutEffect } from "react";
import Modal from "react-modal"; // Import the modal library
import "./TeslaTokenOverlay.css"; // Import your external CSS file
import { async } from "rxjs";

async function getToken() {
    const response = await fetch("/api/getToken?tokenType=tesla_token");
    if (!response.ok) {
        throw new Error("Network response was not ok");
    }
    return response.json();
}

async function fetchData(apiFunction, errorMessage) {
    try {
        const data = await apiFunction();
        if (!data) {
            throw new Error("Token not found");
        }
        return data;
    } catch (error) {
        console.error(errorMessage, error);
        throw error;
    }
}

function RenderTokenOverlay() {
    const [showAlert, setShowAlert] = useState(false);
    const [validating, setValidating] = useState(false);
    const [tokenValidated, setTokenValidated] = useState(false);
    const [validationFailed, setValidationFailed] = useState(false);
    const [textareaValue, setTextareaValue] = useState("");

    const validateToken = async () => {
        try {
            // Perform the API request for token validation
            const response = await fetch("/api/getVehicles");

            if (!response.ok) {
                // Handle the case where the validation request is not successful
                setValidationFailed(true);
                console.error("Validation failed:", response.status, response.statusText);
            } else {
                // Handle the case where the validation is successful
                setTokenValidated(true);
                console.log("Validation successful");
            }
        } catch (error) {
            // Handle other errors that may occur during the validation process
            setValidationFailed(true);
            console.error("Validation failed:", error);
        } finally {
            // End the validation process, whether successful or not
            setValidating(false);
        }
    };

    useEffect(() => {
        const fetchTokenData = async () => {
            try {
                await fetchData(getToken, "Error fetching token file");
            } catch (error) {
                setShowAlert(true);
            }
        };

        const authCheck = eventBus.subscribe((event) => {
            if (event.type === "AUTH_ERROR") {
                const parsedData = event.data;
                if (parsedData === true) {
                    // Set validating to false on AUTH_ERROR
                    setShowAlert(true);
                } else {
                    setShowAlert(false);
                }
            }
        });

        fetchTokenData();

        return () => {
            authCheck.unsubscribe();
        };
    }, []);

    const handleSaveSettings = async () => {
        setValidationFailed(false);
        setValidating(true);

        // Check if the textarea is empty
        if (!textareaValue.trim()) {
            setValidationFailed(true);
            setValidating(false);
            return; // Don't proceed with the API call
        }

        try {
            const response = await fetch("/api/saveToken", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    tesla_token: textareaValue,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed saving token.");
            } else {
                // Reload the entire page after a successful save
                validateToken();
            }
            console.log("Settings saved successfully");
        } catch (error) {
            console.error("Error saving settings:", error);
        }
    };

    return (
        <Modal isOpen={showAlert} onRequestClose={() => setShowAlert(false)} className="shadow-2xl modal" overlayClassName="overlay" closeTimeoutMS={300}>
            <div className="modal-content text-slate-700">
                <button className="close" onClick={() => setShowAlert(false)}>
                    &times;
                </button>
                <h1 className="mb-4 text-2xl font-bold">No Valid Tesla Access Token Found!</h1>
                <hr className="mb-4 border-b border-slate-400" />
                <p className="pb-4">
                    To use this application, you need to provide your unique Tesla Access Token. The easist way to obtain your token is to install the Access
                    Token Generator for Tesla from the Chrome Web Store and authenticate using your Tesla username and password.
                </p>
                <p className="pb-4 pl-8 font-semibold text-blue-500">
                    <a href="https://chromewebstore.google.com/detail/djpjpanpjaimfjalnpkppkjiedmgpjpe" target="_blank">
                        Access Token Generator for Tesla
                    </a>
                </p>
                <p className="pb-4">Once you have generated the token, copy and paste it into the dialog below to validate and save your settings.</p>
                <label className="block mb-2 text-sm font-bold text-slate-700">Tesla Access Token</label>
                <textarea
                    className={`mt-1 block w-full px-3 py-2 bg-white border rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-1
  ${
      validationFailed
          ? "border-red-300 text-red-500 focus:border-red-500 focus:ring-red-500"
          : "border-slate-300 text-slate-700 focus:border-blue-500 focus:ring-blue-500"
  }`}
                    rows="4"
                    id="token"
                    type="textarea"
                    placeholder="eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IkpJcFJCQWlsQ0V1cXZRRjlwUHRtZkhKWnNjYyJ9.eyJpc3MiOiJodHRwczovL2F1dGgudGVzbGEuY29tL29hdXRoMi92MyIsImF1ZCI6Imh0dHBzOi8vYXV0aC50ZXNsYS5jb20vb2F1dGgyL3YzL3Rva2VuIiwiaWF0IjoxNzAwNTI4Njc3LCJzY3AiOlsib3BlbmlkIiwib2ZmbGluZV9hY2Nlc3MiXSwib3VfY29kZSI6Ik5BIiwiZGF0YSI6eyJ2IjoiMSIsImF1ZCI6Imh0dHBzOi8vb3duZXItYXBpLnRlc2xhbW90b3"
                    value={textareaValue}
                    onChange={(e) => setTextareaValue(e.target.value)}
                />

                <div className="grid w-full grid-cols-4 gap-2">
                    <div className="flex col-span-2 pt-2 text-sm">
                        {validating ? "Validating..." : ""}
                        {validationFailed ? <span className="text-red-500">Invalid Token!</span> : ""}
                        {tokenValidated ? <span>Token Validated!</span> : ""}
                    </div>
                    {tokenValidated === true ? (
                        <>
                            {/* Disabled Validate button */}
                            <div>
                                <button
                                    type="button"
                                    className="w-full px-4 py-2 mt-4 font-bold text-white bg-blue-500 rounded opacity-50 cursor-not-allowed hover:bg-blue-700"
                                    disabled>
                                    Validate
                                </button>
                            </div>
                            {/* Active Save button */}
                            <div>
                                <button
                                    type="button"
                                    onClick={() => window.location.reload()}
                                    className="w-full px-4 py-2 mt-4 font-bold text-white bg-blue-500 rounded hover:bg-blue-700">
                                    Save
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <div>
                                {/* Active Validate button */}
                                <button
                                    type="button"
                                    className="w-full px-4 py-2 mt-4 font-bold text-white bg-blue-500 rounded hover:bg-blue-700"
                                    onClick={handleSaveSettings}>
                                    Validate
                                </button>
                            </div>
                            <div>
                                {/* Disabled Save button */}
                                <button
                                    type="button"
                                    className="w-full px-4 py-2 mt-4 font-bold text-white bg-blue-500 rounded opacity-50 cursor-not-allowed hover:bg-blue-700"
                                    disabled>
                                    Save
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </Modal>
    );
}

Modal.setAppElement("#tesla-cgc");

export default RenderTokenOverlay;
