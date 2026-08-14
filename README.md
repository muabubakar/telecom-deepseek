# Telecom Complaint Copilot — Simple EC2 Learning Version

This version deliberately removes Git/GitHub from the learning workflow.

## Flow

`Application files on EC2 -> Jenkins -> Docker build -> Docker Hub`

The app is a guided Nigerian telecom complaint assistant. Consumers choose their operator, issue, timing, impact, provider-contact status and evidence. The server sends the structured facts to DeepSeek and returns a professional complaint. If the complaint is ready for regulatory escalation, the final button opens the user's email client with the complaint pre-filled.

## Important files

- `.env` — the **only** environment file you need for this test.
- `Dockerfile` — builds the Next.js application image.
- `.dockerignore` — explicitly excludes `.env` so the DeepSeek key is not baked into the image.
- `Jenkinsfile` — local-folder Jenkins pipeline; there is no Git checkout.
- `jenkins-pipeline-to-paste.txt` — same pipeline in a file that is easy to copy into the Jenkins web UI.
- `setup-ec2.sh` — installs Docker and Jenkins on an Ubuntu learning server.
- `run-app-manually.sh` — builds and runs the app directly from the EC2 source folder.
- `run-from-dockerhub.sh` — pulls `latest` from Docker Hub and runs it.
- `SETUP-QUICK.txt` — copy/paste deployment guide.

## Application folder expected by Jenkins

`/opt/telecom-copilot`

## Application port

`3000`

## Jenkins port

`8080`

## One environment file

Edit:

```bash
nano /opt/telecom-copilot/.env
```

and put your DeepSeek key there.

For the complete EC2/Jenkins sequence, open `SETUP-QUICK.txt`.
