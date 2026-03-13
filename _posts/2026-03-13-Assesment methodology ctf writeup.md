---
layout: post
title: "ASSESMENT METHODOLOGIES CTF"
author: "Anne"
date: 2026-03-13
categories: CTF
tags: [nmap, gobuster, httrack, wordpress, web-recon]
---

# Introduction

I was tasked to perform reconnaissance on a target machine to acquire flags. The following sections document the specific steps and methodologies that were taken to successfully acquire all targets.

---

# Steps taken to acquire flags

I first performed an Nmap scan on the target machine (`http://target.ine.local`) to check the services and ports running on the system.

`└─$ nmap -p- -sV -A target.ine.local`

![Ine 1](/images/ine/ine1.png)

After enumerating the services, I discovered port 80, and from the HTTP generator, I successfully revealed **FLAG 2**.

## Flag 1: Robots.txt Analysis
This flag relates to the mechanism that tells search engines what to and what not to avoid. From research, I found that the `robots.txt` file instructs search engine crawlers which pages they can access on a website. From the Nmap scan above, we see the `robots.txt` file with one disallowed entry; therefore, I appended the `robots.txt` to the URL and found the first flag.

**URL:** `http://target.ine.local/robots.txt`

![Ine 2](/images/ine/ine2.png)

## Flag 3: Directory Browsing
The hint given directed us toward the possibility that directory browsing might reveal where files are stored. I used **Gobuster** to perform a directory scan on our target machine.

`└─$ gobuster dir -u http://target.ine.local -w /usr/share/wordlists/dirb/common.txt`

![Ine 3](/images/ine/ine3.png)

From the scan, I discovered various directories, but I focused on `/wp-admin`, `/wp-content`, and `/wp-includes`, which I had access to. Upon accessing `/wp-admin`, it displayed a login page, which was not what we were looking for. After some research, I found that the `/wp-content` directory typically stores most user files and uploads. I performed a directory scan on the `wp-content` directory to uncover any hidden subdirectories by appending the URL to `http://target.ine.local/wp-content`.

`└─$ gobuster dir -u http://target.ine.local/wp-content -w /usr/share/wordlists/dirb/common.txt`

![Ine 4](/images/ine/ine4.png)

I found various subdirectories, but I focused on the `/uploads` directory, as it may contain files and uploads from users. Upon accessing the URL (`http://target.ine.local/wp-content/uploads`), I discovered a `flag.txt` file, which contained our **FLAG 3**.

![Ine 5](/images/ine/ine5.png)

![Ine 6](/images/ine/ine6.png)

## Flag 4: Sensitive Backup Files
An overlooked backup file in the webroot can be problematic if it reveals sensitive configuration details. Backup files typically have the `.bak` extension, so I performed a scan for backup files on the target machine specifically looking for that extension.

`└─$ gobuster dir -u http://target.ine.local -w /usr/share/seclists/Discovery/Web-Content/common.txt -x bak`

![Ine 7](/images/ine/ine7.png)

I found various backup files, but the hint indicated that the file might reveal sensitive configuration details; therefore, `/wp-config.bak` seemed interesting and was also accessible. On accessing the directory, the file `wp-config.bak` was downloaded into our target machine. From the downloads directory where the file was stored, I accessed the contents of the `wpconfig.bak` file and found **FLAG 4**.

**URL:** `http://target.ine.local/wp-config.bak`

![Ine 8](/images/ine/ine8.png)

![Ine 9](/images/ine/ine9.png)

![Ine 10](/images/ine/ine10.png)

## Flag 5: Website Mirroring
Certain files may reveal something interesting when mirrored. To acquire flag 5, I used the tool **HTTrack**, which is used to mirror a website. I mirrored the website and saved it to the Downloads directory.

`└─$ httrack http://target.ine.local -O /root/Downloads`

![Ine 11](/images/ine/ine11.png)

I then switched to the `target.ine.local` directory, which had been mirrored on my attacking machine, and listed its contents.

`└─$ ls -l`
![Ine 13](/images/ine/ine13.png)

After analyzing each file found above, I found **flag 5** on the `xmlrpc0db0.php` file.

`└─$ cat xmlrpc0db0.php`

![Ine 14](/images/ine/ine14.png)
---

## Conclusion

This assessment highlighted the importance of thorough web enumeration. By checking standard files like `robots.txt`, performing directory brute-forcing, and analyzing backup files or mirrored content, I was able to successfully recover all flags.

Happy Hacking!