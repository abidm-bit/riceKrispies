spring-boot-starter-web
spring-boot-starter-data-jpa
Postgresql 
Lombok
Spring security
JWT 
BCrypt



This is the schema for the users table 
CREATE TABLE users (
    user_id serial4 NOT NULL,
    email varchar(255) NOT NULL,
    password_hash varchar(255) NOT NULL,
    created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT users_email_key UNIQUE (email),
    CONSTRAINT users_pkey PRIMARY KEY (user_id),
);


This is the schema for the allKeys table 
CREATE TABLE allKeys(
key  NOT NULL 
burned (boolean) NOT NULL,
burned_by serial4 
)
The user_id is a foreign key with the users table



burned will be false by default
burned_by will be NULL until the key is selected/queried using the GET command, and then it will be updated


CorsConfigClass
Disable csrf 
secure CORS (CorsConfig)
	- allow requests from the frontend url & the backend url
	- allowed METHODS (GET,POST)
	- permit all requests for the homepage, registration & login (these are public)
	- Users have to be authenticated & authorized for the fetchKeys endpoint (used by the fetch keys page)
	- rate limiting for registration + login
		- registration 
			- 5 requests/ip for 24 hours
		- login 
			- 10 requests/ip for 24 hours

	- rate limiting for fetch keys 

@POSTMapping(/users/register/)
@POSTMapping(/users/login/)

@GETMapping(/fetchKeys/)
Get a single record from this endpoint. 
Request body: userId 
Response body:  key: XXXX-XXXX-XXXX-XXXX, userId: (record the userId that burned the key) 

1. A get request will fetch the key ( a single key)
2. The response body returns the key and the user id
3. The allKeys table will be updated:
- The corresponding key’s burned column will be updated from False to True
- The corresponding key’s burned_by column will be updated with the user id (the user who fetched the key)



Model directory: 



AUserModel.java (Model class for the user)
@Entity
@Table(users)
@GeneratedValue
@Column(unique=true,nullable =false)
private Integer user_id; will be generated after registration 

@Column(unique=true,nullable =false)
private String email;  

@Column(nullable =false)
**Encrypt this using BCrypt** 
private String password;  

@Column(name = "created_at", nullable = false, updatable = false)
private LocalDateTime createdAt;


This class will be extended by the AUserRespository. Each record will be a request to the registration or login endpoint


AKeyModel.java (Model class for the record) 
I’ll generate 100,000 keys user python’s faker library and insert each key. 
The burned boolean is updated 
The burned_by is updated using the userId.


@Entity
@Table(allKeys)
@Column(unique=true,nullable =false)
private String key; 
@Column
private boolean burned;  
@Column
Private Integer burned_by;







Generate the schema for registration (A post request to /users/register/) this will be a insert into users table)
The registration method will first check if the email exists
If not> proceed with registration 
If the email already exists, throw a 409 Conflict error: “bad request”
The password should be 8-100 characters && have at least one UpperCase character and at least one special character 
If an email isn’t input & a password is, throw a 400 bad request error : “invalid registration”
If a password is input & an email isn’t, throw a 400 bad request error : “invalid registration”
If the password doesn’t meet the requirements, throw a 400 bad request error : “invalid registration”


Generate the schema for logging in (a post request to users/login/) this will check if the email exists in the database
If the email does not exist, throw a 400: wrong credentials
then check the password hash. 
If the hashed password doesn’t match for that user, throw a 400 error: wrong credentials
If the credentials are correct> the user will be authorized & given a JWT token, 200 success code, the response body will be the userID and the JWT token. 
Once users are authenticated they will be logged in and are authorized to interact with the /fetchKeys/ endpoint.


Generate the schema for getting a key (a get request to /fetchKeys/)
1. A get request will fetch the key ( a single key)
2. The response body returns the key and the user id
3. The allKeys table will be updated:
- The corresponding key’s burned column will be updated from False to True
- The corresponding key’s burned_by column will be updated with the user id (the user who fetched the key)

Further requests should not fetch any keys that have a True in the burned column (So keys will never be reused/ fetched more than once). 







Repository directory:

AUserRepository.java (Interface extends JPARepository<AUserModel,Integer>)
<Optional> checkIfUserEmail exists … will be used to check if the email exists (for registration & login)
<Optional> checkIfUserID exists …  when retrieving a record (the userID will be recorded with each key query)

AKeyRepository.java(Interface extends JPARepository<AKeyRecord,Integer>) 
Uses the checkIfUserID exists, then passed the ID… to get a record & update the burned_by column 



Vite React + Tailwind CSS 

StartingPage (public url for the project) 
	- Welcome text : must log in, purpose, etc. 
	- Vite: Register or Login , switch between the two 
	- Register button > registration endpoint
	- Login button > login endpoint
Registration Page (public endpoint)
Login Page (public endpoint) 
LandingPage (users have to be authenticated & authorized, this fetches from the /fetchKeys/ endpoint)
- the page will have a single window: the text hello world , a generateButton, once users click this generate Button, this will send a GET request to /fetchKeys) and display the key in the box





spring-boot-starter-mail - add on email verification 

