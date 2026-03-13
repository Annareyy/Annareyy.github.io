---
layout: post
title: "CFSS Report"
date: 2026-03-12
author: Anne
categories: CTF
---

# PRACTICAL WALKTHROUGH OF THE CHALLENGES I DID.

## PRACTICAL CHALLENGES
### Introduction
I was tasked to perform various capture the flag challenges by simulating attacks,identifying vulnerabilities and exploiting them. The report gives detailed steps that I performed and completed in order to gain root access and acquire ctf flags.

### Challenge 1: ctflearn challenge 114.
**POST Practice.**
* **Description:** This website requires authentication, via POST. However, it seems as if someone has defaced our site.Maybe there is still some way to authenticate?
*http://165.227.106.113/post.php*
![cfss 1](/images/cfss/cfss1.png)

* **Steps:**
    1. I first viewed the site provided: http://165.227.106.113/post.php to get the output, and I got an important comment.
    ![cfss 2](/images/cfss/cfss2.png)
    2. The site displayed “This site takes Post data that you have not submitted”. I opened Burp suite to intercept the request. From the output displayed we have to change the request to POST and see what is displayed.
    Note: Intercept should be on for one to intercept requests.
    ![cfss 2.1](/images/cfss/cfss2.1.png)
    3. After intercepting the request I sent it to repeater from proxy.
    ![cfss 3](/images/cfss/cfss3.png)
    4. I sent a get request in repeater to get a response, and I got login details: *username- admin and password-71urlkufpsdnlkadsf* which were commented on the response as shown below.
    ![cfss 4](/images/cfss/cfss4.png)
    5. After acquiring the login details, I changed the GET request to POST on line 1 as requested,then went ahead to add the login details as shown on line 12 of the request part below.
    ![cfss 5](/images/cfss/cfss5.png)
    6. I sent the request after modifying it, and the response revealed our flag :{p0st_d4t4_4ll_d4y}
    ![cfss 6](/images/cfss/cfss6.png)

### Challenge 2: CTFlearn Challenge 109
**Don't Bump Your Head(er)**
* **Description:** Try to bypass my security measure on this site! http://165.227.106.113/header.php
* **Steps:**
    1. I opened the link: http://165.227.106.113/header.php and **“Sorry, it seems as if your user agent is not correct, in order to access this website. The one you supplied is: “Mozilla/5.0 (X11;Linux x86_64; rv 109.0) Gecko/20100101 Firefox/115.0”** was displayed.
    ![cfss 7](/images/cfss/cfss7.1.png)
    2. In Burp Suite, found a hint: `Sup3rS3cr3tAg3nt`.
    ![cfss 7](/images/cfss/cfss7.png)
    3. Updated User-Agent, but then required a specific referrer: `awesomesauce.com`.
    ![cfss 8](/images/cfss/cfss8.png)
    4. Added the referrer to the header.
    ![cfss 9](/images/cfss/cfss9.png)
    5. **Flag:** `{did_this_m3ss_with_your_h34d}`.
    ![cfss 10](/images/cfss/cfss10.png)

### Challenge 3: Defend the Web Challenge
**Where am I?!**
The challenge displays a single input field to enter the correct password.
* **Steps:**
1. I first submitted a random password and it displayed invalid login details.
![cfss 11](/images/cfss/cfss11.png)
2. I resubmitted another random password this time I captured the request using burp suite.
![cfss 12](/images/cfss/cfss12.png)
3. Upon right-clicking on the page, I selected "Send to Repeater" and proceeded to send the request in order to get a response. However, nothing of interest was displayed.
![cfss 13](/images/cfss/cfss13.png)
4. I modified the post request by removing the getoutofhere and added login on line 1 to retrieve our random password. 
5. The request revealed the password: `2e993e738d`
![cfss 14](/images/cfss/cfss14.png)
![cfss 15](/images/cfss/cfss15.png)

### Challenge 4: PicoCTF Challenge 262
**CVE-XXXX-XXXX**
* **steps:**
* **Description:** Find the first recorded Windows Print Spooler RCE vulnerability from 2021.
I opened my browser and searched the CVE that was the first recorded remote execution in
2021 in the windows print spooler service. I got the following response: PrintNightmare (CVE-
2021-3452)from:https://blog.qualys.com/vulnerabilities-threat-research/2021/07/07-
microsoft-windows-print-spooler-rce-vulnerability-printnightmare-cve-2021-34527 as shown
in the image below.
![cfss 16](/images/cfss/cfss17.png)
* **Flag:** `picoCTF{CVE-2021-34527}` (PrintNightmare).
![cfss 18](/images/cfss/cfss18.png)

### Challenge 5: PicoCTF Challenge 109
**It is my Birthday**
* **Steps:** 
1. Opened the link http://mercury.picoctf.net:57247/ and it displayed a page that requests
for two upload.
![cfss 19](/images/cfss/cfss19.png)
2. From the description of the challenge two invite have the same md5hash but are slightly
different therefore there is an md5 collsion. I did my research and came across a site:
https://crypto.stackexchange.com/questions/1434/are-there-two-known-strings-which-have-
the-same-md5-hash-value that has two message files with an md5 collision.
![cfss 20](/images/cfss/cfss20.png)
3. Uploaded two different PDF files with the same MD5 hash to trigger a collision.Note: files must be in pdf format.
![cfss 21](/images/cfss/cfss21.png)
* **Flag:** `picoCTF(c0ngr4ts_u_r_invit3d_aad886b9)`.
![cfss 22](/images/cfss/cfss22.png)

### Challenge 6: PicoCTF Challenge 4
**Where are the robots**
* **Steps:**
1. I accessed the given URL in browser and “Welcome Where are the robots?” was displayed.
![cfss 23](/images/cfss/cfss23.png)
2. I right clicked on the webpage to view source and nothing of interest was displayed.
![cfss 24](/images/cfss/cfss24.png)
3. It clicked that the word robots can be attributed to the robots.txt file that tells the search engine
crawler’s which URLs the crawlers can access on the site.So I accessed the robots.txt file by adding /robots.txt on the URL of the site to get the output displayed below.
https://jupiter.challenges.picoctf.org/problem/60915/robots.txt
![cfss 25](/images/cfss/cfss25.png)
4. Accessed `robots.txt` and found a disallowed directory `/8028f.html`.
* **Flag:** `picoCTF{ca1cu1at1ng_Mach1n3s_8028f}`.
![cfss 26](/images/cfss/cfss26.png)



