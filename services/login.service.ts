import Constants from "expo-constants";

const url =
  Constants.expoConfig?.extra?.apiUrl || "https://wihngo-api.onrender.com/api/";

export async function loginService(email: string, password: string) {
  console.log(
    "Constants.expoConfig?.extra?.apiUrl",
    Constants.expoConfig?.extra?.apiUrl
  );
  console.log(`Logging in to ${url}auth with email: ${email}`);
  return fetch(`${url}auth`, {
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
