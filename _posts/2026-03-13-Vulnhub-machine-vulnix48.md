---
layout: post
title: "Vulnix machine 48"
author: "Anne"
date: 2026-03-13
categories: [machines]
tags: [vulnhub, linux, enumeration, privilege-escalation, penetration-testing]
---

## Description

The goal of this machine is to boot the VM, discover its IP address, exploit the available services, and obtain the trophy hidden in `/root` by any means necessary — excluding modifying the `.vmdk` file.

---

## Reconnaissance

I began by gathering information about the **Vulnix machine**. First, I checked the IP address of my Kali machine to determine the network range.

`└─$ ifconfig`.
![vulnix 1](/images/vulnhub/vulnix1.png)

I then scanned for the ip address using the range of my kali’s machie ip address and found two
hosts one which was my attacking machine’s ip address and the vulnix machine ip address
since I placed them on the same network.
Vulnix’s ip address-192.168.56.112

`└─$ nmap –sn 192.168.56.0/24`

![vulnix 2](/images/vulnhub/vulnix2.png)

## Service enumeration
I scanned the targets ip address for any open ports and their services using nmap.

`└─$ sudo nmap -A -p- -Pn 192.168.56.112`
![vulnix 3](/images/vulnhub/vulnix3.png)
![vulnix 4](/images/vulnhub/vulnix4.png)

I got several open ports and their services:
* Port 22: SSH
* Port 25: SMTP
* Port 79: Finger
* Port 110: POP3
* Port 111: RPCbind
* Port 143: IMAP
* Port 512: RSH (Remote shell)
* Port 513: RLogin
* Port 514: shell?

----

## GAINING ACCESS

### Inspecting port 25-SMTP
I opened metasploit on terminal using msfconsole and searched for a smtp exploit.

`└─$ sudo msfconsole`
`Msf6 > search smtp`
![vulnix 5](/images/vulnhub/vulnix5.png)

I selected the auxiliary/scanner/smtp/smtp_enum for user enumeration since I was looking for
any available usernames.
![vulnhub 6](/images/vulnhub/vulnix6.png)
I then checked whether all parameters were set before running an exploit on the target machine.
Note: metsaploit uses the wordlists file on User-file to check for any possible user accounts.
![vulnhub 7](/images/vulnhub/vulnix7.png)
The target host ip address also named as RHOSTS on the above image wasn’t set yet so I modified it by running the command: `set RHOSTS 192.168.56.112` as shown above.

I then rechecked whether everything was set up correctly and run the exploit command ;several possible Users were found.
![vulnhub 9](/images/vulnhub/vulnix9.png)

After getting possible users I decided to perform a brute force using random passwords and usernames from the user accounts found on wordlists but I got no possible password.
I decided to explore other open ports.

### Inspecting port 79:-Finger
I checked for any user information on port 79 and I discovered two other possible users: user
and Dovenull.

`└─$ finger user@192.168.56.112`
![vulnhub 10](/images/vulnhub/vulnix10.png)

### Inspecting port 111
I noticed that there was an NFS service port 2049 and decided to try and exploit it. An nfs
allows a user to share files across a network. I ran the showmount command to check for any
file shares.

`└─$ sudo showmount -e 192.168.56.112`

![vulnhub 11](/images/vulnhub/vulnix11.png)

From the above image we find a share /home/vulnix which fully confirms that a user named
vulnix exists since users reside in the home directory.
I then created a directory /home/nfs which I mounted the share /home/vulnix so that I could
access the user id of vulnix.

`└─$ sudo mkdir /home/nfs`

![vulnhub 12](/images/vulnhub/vulnix12.png)

`└─$ sudo mount 192.168.56.112:/home/vulnix /home/nfs –o vers=3`

![vulnhub 13](/images/vulnhub/vulnix13.png)

I listed the details in the created directory /home/nfs and acquired the UID 2008.

`└─$ sudo ls –lash /home/`

![vulnhub 14](/images/vulnhub/vulnix14.png)

I created a user named "vulnix" with the user ID 2008. We know that a user named
"vulnix" exists from share we discovered earlier. This will trick the NFS into giving me access
to the share, as the NFS checks permissions using the user ID.

`└─$ sudo adduser –u 2008 vulnix`
![vulnhub 15](/images/vulnhub/vulnix15.png)

I switched to the user account vulnix since I couldn’t access the contents in the shared directory as a different user.
![vulnhub 16](/images/vulnhub/vulnix16.png)

As you can see below I can now list the contents in the share directory as /home/nfs since it is
linked to the /home/vulnix as we mounted it previously.

`└─$ ls –lash /home/nfs`

![vulnhub 17](/images/vulnhub/vulnix17.png)

I then created a directory called /home/nfs/.ssh whereby I’ll generate and store authorized keys
that I will use to gain access to the machine.

`└─$ mkdir /home/nfs/.ssh`
![vulnhub 18](/images/vulnhub/vulnix18.png)

I generated rsa keys whereby the private key will be used to gain access to the vulnix machine.

`└─$ ssh-keygen –t ssh-rsa`
![vulnhub 19](/images/vulnhub/vulnix19.png)

I confirmed whether the keys have been stored on the .ssh folder.

![vulnhub 20](/images/vulnhub/vulnix20.png)

I performed a final verification to ensure the contents of my local `id_rsa.pub` matched the `authorized_keys` file on the remote share.

`└─$ cat id_rsa.pub`

`└─$ cat /home/nfs/.ssh/authorized_keys`

![vulnhub 23](/images/vulnhub/vulnix23.png)

With the keys synchronized, I established a stable SSH connection to the Vulnix machine by specifying the RSA algorithm.

`└─$ ssh –o PubkeyAcceptedAlgorithms=+ssh-rsa vulnix@192.168.56.112`
![vulnhub 24](/images/vulnhub/vulnix24.png)

Upon initial entry, a directory listing was performed; however, no immediate files of interest were found in the user's home directory.

`└─$ ls -la`

![vulnhub 25](/images/vulnhub/vulnix25.png)


---

## PRIVILEGE ESCALATION

## Exploiting NFS Misconfiguration
To identify a path to root, I audited the user's sudo privileges. The output of `sudo -ll` revealed that the user could interact with `/etc/exports` without a password. This file is critical as it dictates how the Network File System (NFS) shares directories.

`└─$ sudo -ll`
![vulnhub 26](/images/vulnhub/vulnix26.png)

I leveraged this by modifying the `/etc/exports` file to share the root directory (`/`) with the `no_root_squash` option. This specific configuration ensures that a remote root user is treated as the actual root on the target system, rather than being demoted to a low-privilege user.
![vulnhub 27](/images/vulnhub/vulnix27.png)

After a system reboot to apply the new export configurations, I verified the new share from my attacking machine.

`└─$ su vulnix`

`└─$ showmount -e 192.168.56.112`

![vulnhub 28](/images/vulnhub/vulnix28.png)

## Root Access and Flag Recovery
I created a new mount point locally and attached the target's root partition to it.

`└─$ sudo mkdir /home/vuln2`
![vulnhub 29](/images/vulnhub/vulnix29.png)

`└─$ sudo mount 192.168.56.112:/root /home/vuln2`

![vulnhub 30](/images/vulnhub/vulnix30.png)

By navigating to the mounted root directory, I gained full visibility of the system files. I located the `trophy.txt` file within the root user's home folder.

`└─$ sudo ls -lash /home/vuln2`

![vulnhub 31](/images/vulnhub/vulnix31.png)

`└─$ sudo cat /home/vuln2/trophy.txt`

**Flag Captured:** The contents of `trophy.txt` were successfully retrieved, confirming full system compromise.
![vulnhub 32](/images/vulnhub/vulnix32.png)