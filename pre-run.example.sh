apk add --no-cache openssh-client
ssh -o ServerAliveInterval=60 -o ServerAliveCountMax=3 -fN -L 60003:localhost:8000 s3@s3.example.com &
ssh -o ServerAliveInterval=60 -o ServerAliveCountMax=3 -fN -L 60004:localhost:8000 s4@s4.example.com &
