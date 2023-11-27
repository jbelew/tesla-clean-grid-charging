import { NextResponse } from "next/server";
import { TeslaApi } from '../../utils/TeslaApi';

const token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IkpJcFJCQWlsQ0V1cXZRRjlwUHRtZkhKWnNjYyJ9.eyJpc3MiOiJodHRwczovL2F1dGgudGVzbGEuY29tL29hdXRoMi92MyIsImF1ZCI6Imh0dHBzOi8vYXV0aC50ZXNsYS5jb20vb2F1dGgyL3YzL3Rva2VuIiwiaWF0IjoxNzAwMDA1MDQ1LCJzY3AiOlsib3BlbmlkIiwib2ZmbGluZV9hY2Nlc3MiXSwib3VfY29kZSI6Ik5BIiwiZGF0YSI6eyJ2IjoiMSIsImF1ZCI6Imh0dHBzOi8vb3duZXItYXBpLnRlc2xhbW90b3JzLmNvbS8iLCJzdWIiOiJkOTdiNDUxNy1hOWE2LTQyNjUtODdlZS02ZmI0ODJmOWNlNjMiLCJzY3AiOlsib3BlbmlkIiwiZW1haWwiLCJvZmZsaW5lX2FjY2VzcyJdLCJhenAiOiJvd25lcmFwaSIsImFtciI6WyJwd2QiXSwiYXV0aF90aW1lIjoxNzAwMDA1MDQ0fX0.InlaYVDMxd5oOs6l0abkdbNJFz_nZ0J7xJ9MLyDQ1eO-u_xgQLTkgdAVMqa5wYHHq4pMBBQPnLE8IZVrUyE2lZoYUQWraQ-DkG4zyADi2hjc3zimhhq6bZF5gNOuGLz34fuynQQZId0o9tcXDGc9enLTRSCe1wF0CLTRbOM_w3tuuNIqFTK0UbHHrWgmTATByzHLcqxiMy4353rMWAA1W5MqVmESwfP70glg2BVMvNfSZs_8TIHg1xsEjbLPPmctFeLR3TXfoTmfgqJ0xKsjL-UjRtT3kElzGvDAhoQeMydDt-RBbmRI8TI06zrUQJOVaRLXuVhGw58-zn8mMRfaiA";
const api = new TeslaApi(null, null, token);

export async function GET(request) {
	const url = new URL(request.url);
	const id = url.searchParams.get("id");
  
	// Check if the 'id' parameter is present
	if (!id) {
	  return NextResponse.json({ error: 'Missing required parameter: id' }, { status: 400 });
	}
  
	// Use the 'id' parameter in your API request
	try {
	  const vehicleData = await api.wakeUp(id);
	  return NextResponse.json(vehicleData, { status: 200 });
	} catch (error) {
	  console.error('Error while waking up the vehicle:', error);
	  return NextResponse.json({ error: 'Failed to wake up the vehicle' }, { status: 500 });
	}
  }