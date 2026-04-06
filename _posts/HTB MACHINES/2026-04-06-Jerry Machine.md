---
layout: post
title: "JERRY MACHINE"
date: 2026-04-06
categories: [HTB, Machine]
tags: [Apache, Windows, Tomcat, Metasploit, RCE]
image: /images/jerry/banner.png
---

# Jerry Machine Overview

The **Jerry** machine is an easy-rated Windows box on Hack The Box that focuses on exploiting a misconfigured Apache Tomcat manager application. The primary objective is to move from initial enumeration to a full administrative compromise by leveraging default credentials found within the application's own error pages.

---

# INITIAL ACCESS

## Information Gathering
The machines ip adressed was shared on htb machine labs access.

**Target IP Address:** `10.129.13.192`


## Service Enumeration

I scanned the target for open ports and services using `nmap` to identify the attack surface:

`└─$ sudo nmap -p- -sV -sS 10.129.13.192`

![jerry 1](/images/jerry/jerry1.png)

The scan revealed a single open port:
* **Port 8080:** Running Apache Tomcat/Coyote JSP engine 1.1.

---

# GAINING ACCESS

## Inspecting Port 8080: Apache Tomcat

Navigating to `http://10.129.13.192:8080` in the browser confirmed that **Apache Tomcat/7.0.88** was running on the server.

![jerry 2](/images/jerry/jerry2.png)

I accesed the server status page using default credentials username admin and password admin but nothing interesting was displayed.

### Web Application Manager

I identified that the path `/manager/html` leads to the **Tomcat Web Application Manager**. Upon attempting to access this path using default credentials: username-admin and password-admin, I was met with a **403 Access Denied** page.

![jerry 3](/images/jerry/jerry3.png)

The error page provided a hint regarding default credentials, suggesting that a user named `tomcat` with the password `s3cret` could be used. 


I first cleared my browser history in order to get access to the authentication page to input the credentials found.(Issue was thet if you clicked back to the html page and then try accessing the page with new credntils the error was being displayed instead of a login page).

I attempted to log in using these credentials:
* **Username:** `tomcat`
* **Password:** `s3cret`

The login was successful, granting me access to the **Tomcat Web Application Manager** interface.

![jerry 4](/images/jerry/jerry4.png)

## Exploitation

From the page i realized one can upload a war file and decided to do my research.

![jerry 5](/images/jerry/jerry5.png)

I learned apche tomcat the version i had 7.0.8 was vulnerable to remode code execution and jsp upload bypass.

![jerry 6](/images/jerry/jerry6.png)


I first tried to use the msfvenom payload using java jsp to get shell access but was experiencing some issues for anyone interested i would advice you to run the msfvenom command and generate a malicious WAR file containing a Java JSP reverse shell. Upload the patload on the manager html page then setup a netcat listener and a shell will be provided.

### Metasploit Research
So i went ahead to try a second method which was using the metasploit framework.
 I used the **Metasploit Framework** to search for available modules targeting Apache Tomcat. The search returned several excellent candidates for Remote Code Execution (RCE), including `exploit/multi/http/tomcat_mgr_upload`.

 ![jerry 7](/images/jerry/jerry7.png)

### Setting up the Payload

I setup the rquired parameters then run the exploit.

`└─$ set rhosts 10.129.13.192`
`└─$ set HttpPassword s3cret`
`└─$ set HttpUsername tomcat`
`└─$ set rport 8080`

![jerry 8](/images/jerry/jerry8.png)

### Deploying the Shell

After running the exploit i got a meterpreter session as NT AUTHORITY\SYSTEM which indicates that i had achieved the highest level of privilege on the Windows machine. I listed the directories available then switched to shell.

---

# POST-EXPLOITATION

With administrative access, I navigated to the users directory(it was among the listed directories) then i found  an Administrator's directory. I listed its contents and analyzed them one by one. While analyzing the desktop directory i found a  flags directory with a weird named txt file ="2 for the price of 1.txt".

`C:\Users\Administrator> dir`
`C:\Users\Administrator> cd Desktop`

![jerry 9](/images/jerry/jerry9.png)

I accessed the txt contents and found the user  and root flags.

![jerry 10](/images/jerry/jerry10.png)