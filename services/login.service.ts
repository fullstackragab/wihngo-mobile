import Constants from "expo-constants";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export async function loginService(email: string, password: string) {
  console.log(
    "Constants.expoConfig?.extra?.apiUrl",
    Constants.expoConfig?.extra?.apiUrl
  );
  console.log(`Logging in to ${API_URL}auth with email: ${email}`);
  return fetch(`${API_URL}auth`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });
  // return fetch(`${url}auth`, {
  //   method: "GET",
  //   headers: {
  //     responseType: "text/plain",
  //   },
  // });
}
