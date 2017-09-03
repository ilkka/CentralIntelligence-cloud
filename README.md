# Central Intelligence "cloud" config

This repo contains orchestration stuff for the Central Intelligence thingy.

## Contents

`docker-compose.yml` -- a v3 compose file that can be used to deploy the server and a bunch of clients onto a Docker Swarm. The image tags point at a particular Elastic Container Registry, you will probably want to change those. The voicebot is commented out because probably your Docker Swarm doesn't have audio.

`docker-compose.override.yml` -- an override file that allows running all the bits in `docker-compose.yml` on a normal Docker engine that is not part of a Swarm.

## How to use it

### Preparation

Clone [CentralIntelligence-server], [CentralIntelligence-laptimes], [CentralIntelligence-telegram], [CentralIntelligence-weather] and [CentralIntelligence-voicebot] into the same place where you have cloned this repo. [Install Docker] >= 17.06 and [Docker Compose] >= 1.15.0.

[CentralIntelligence-server]: https://github.com/mikko/CentralIntelligence-server
[CentralIntelligence-laptimes]: https://github.com/mikko/CentralIntelligence-laptimes
[CentralIntelligence-telegram]: https://github.com/mikko/CentralIntelligence-telegram
[CentralIntelligence-weather]: https://github.com/mikko/CentralIntelligence-weather
[CentralIntelligence-voicebot]: https://github.com/mikko/CentralIntelligence-voicebot
[Install Docker]: https://docs.docker.com/engine/installation/
[Docker Compose]: https://docs.docker.com/compose/install/

Get an FMI API key and a Telegram bot API key.

Get an instance of the fabled laptimes service.

### Configuration

Create the following files in the same directory as the compose files, with the following contents:

`laptimes-authkey`, `telegram-authkey`, `voicebot-authkey` and `weather-authkey` -- plain text files that contain only the auth keys these clients use when talking to the server.

`laptimes-config.json` -- a JSON object like this:

```json
{
    "laptimesHost": "hostname of the laptimes instance"
}
```

`telegram-config.json` -- a JSON object like this:

```json
{
    "apikey": "the API key from @botfather"
}
```

### Running in non-swarm mode

Just run

```sh
env FMI_APIKEY="your-api-key" docker-compose up
```

and you should end up with a functioning server that you can talk to yourself on the Docker host on port 3000. Ask your bot for the weather at some place, for example in Tampere. Be amazed.

All the other services also publish some ports just for development and debugging purposes.

### Running in a Swarm

Build and push the images with

```sh
docker-compose build && docker-compose push
```

Then deploy the stack with

```sh
env FMI_APIKEY="your-api-key" docker stack deploy -c docker-compose.yml central-intelligence
```

## How's it work then

The setup uses v3.3 Compose files so it can leverage secrets and configs to configure individual services. Each piece of the stack (each CentralIntelligence repo, that is) gets its own Swarm service. All services are configured to run in replicated mode with a single replica.

As for running in Swarm, when the stack is deployed, authkeys for the individual services are read from local files and stored as encrypted secrets in the Swarm. The Swarm then uses Fancy Tricks to deliver them as ramdisk mounts in the service containers as they are scheduled. They can then be read into memory from files. Secrets always appear in `/run/secrets`, so slight modifications to the service code is necessary.

Configs work the same way as secrets except that they are not stored encrypted, and we can decide for ourselves where they are mounted in the container filesystem. Therefore configs are used to deploy laptimes and telegram config files which are read simply with `require('./config')`. It should be noted that this is not a good way to deliver the bot API key since it is a secret.

For running on a plain Docker Engine, the automatic override functionality of `docker-compose` is used to turn the (ignored) configs into normal bind mounts. The secrets are automatically turned into bind mounts in this case.