---
layout: post
title: "MCskidy Easter Egg Passcode Challenge"
date: 2026-03-14
categories: CTF
tags: [linux, enumeration]
image: /images/advent/banner.png
---

# Advent of Cyber 2025 – Day 1 Side Quest: Clues-Solving Walthrough.
---

## Introduction
From the quest we are required to access a directory
/home/mcskidy/Documents. After accessing the directory you list the
content and read the read-me-please.txt file which contains the below
content.

└─$ root@tbfc-web01:/home/mcskidy/Documents$ cat read-meplease.txt

From: mcskidy  
To: whoever finds this  

I had a short second when no one was watching. I used it.  
I've managed to plant a few clues around the account.  

If you can get into the user below and look carefully,  
those three little "easter eggs" will combine into a passcode  
that unlocks a further message that I encrypted in the  
/home/eddi_knapp/Documents/ directory.  

I didn't want the wrong eyes to see it.  

Access the user account:  
username: eddi_knapp  
password: S0mething1Sc0ming  

There are three hidden easter eggs.  
They combine to form the passcode to open my encrypted vault.  

Clues (one for each egg):

1)  
I ride with your session, not with your chest of files.  
Open the little bag your shell carries when you arrive.  

2)  
The tree shows today; the rings remember yesterday.  
Read the ledger’s older pages.  

3)  
When pixels sleep, their tails sometimes whisper plain words.  
Listen to the tail.  

Find the fragments, join them in order, and use the resulting passcode  
to decrypt the message I left. Be careful — I had to be quick,  
and I left only enough to get help.  

~ McSkidy  

The text contains username and password and 3 clues.

---

## Accessing the Account

Solving the clues.

First ssh into the account with the provided credentials.

└─$ ssh eddi_knapp@10.80.170.171  

Access the user account:  
username: eddi_knapp  
password: S0mething1Sc0ming  

![advent 1](/images/advent/advent1.png)
---

## CLUE 1

I ride with your session, not with your chest of files.  
Open the little bag your shell carries when you arrive.  

From the clue above it’s talking about a shell environment on our current session. Therefore I listed the content on eddi_knapp and found a .bashrc which is a shell startup file that runs every time you open a new interactive Bash shell.

└─$ ls -la  

![advent 2](/images/advent/advent2.png)

After accessing the content from the shell the message is shown at the end.

PASSFRAG1="3ast3r"

└─$ cat .bashrc  

![advent 3](/images/advent/advent3.png)
---

## CLUE 2

The tree shows today; the rings remember yesterday.  
Read the ledger’s older pages.  

Based on the clue provided, it appears to reference past pages, historical content, or hidden information. While reviewing the directory listing, I identified several hidden or suspicious directories. Among them, the .secret.git directory stood out, as it contains a .git directory. Considering Git’s purpose—to store historical versions, changes, and metadata of files—this aligns directly with the clue suggesting the presence of past or secret information.

└─$ cd .secret_git  
└─$ ls -la  

![advent 4](/images/advent/advent4.png)

After listing the contents of the Git directory, I identified a file named COMMIT_EDITMSG. This file typically contains the commit message associated with the most recent Git commit.

└─$ cd .git  
└─$ ls -la  

![advent 5](/images/advent/advent5.png)

From the content in the file there was 2 commands committed to a secret_note.txt. One was the addition of a private note and the second removal of sensitive note.

└─$ cat COMMIT_EDITMSG  

![advent 6](/images/advent/advent6.png)

When I ran the hashes of each I got the second clue.

└─$ git show b65ff21  

PASSFRAG2: -1s-  

![advent 7](/images/advent/advent7.png)

└─$ git show 98f456c  

![advent 8](/images/advent/advent8.png)
---

## CLUE 3

When pixels sleep, their tails sometimes whisper plain words.  
Listen to the tail.  

When the clue mentioned “pixel,” it suggested something related to images. Another phrase, “listen to the tail,” also caught my attention. During the directory enumeration, I identified a Pictures directory, which aligned with the pixel-related hint. I navigated into the directory and listed its contents for further analysis.

└─$ ls -la  

![advent 9](/images/advent/advent9.png)

From the content I saw an easter.egg which looked suspicious.  

![advent 10](/images/advent/advent10.png)

I cat the contents form the easter.egg and found the 3rd clue.

PASSFRAG3: c0M1nG  

└─$ cat .easter_egg  

![advent 11](/images/advent/advent11.png)
---

## Final Passcode

After combing the 3 clues we get a passcode that can decrypt the image.

3ast3r-1s-c0M1nG

