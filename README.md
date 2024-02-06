# RU Server Docker

[![GitHub Workflow Status](https://img.shields.io/github/workflow/status/prinako/ru-server-docker/Build%20and%20Push%20Docker%20Image?label=Docker%20Build)](https://github.com/prinako/ru-server/actions/workflows/docker-image.yml)
![Licença](https://img.shields.io/github/license/prinako/ru-server-docker)

## Visão Geral

Este repositório contém o Dockerfile necessário para construir e executar o servidor do RU (Restaurante Universitário) da Universidade Federal do Pará para o aplicativo RU Digital UFPA.

## Pré-requisitos

Certifique-se de ter o Docker instalado em seu sistema.

- [Guia de Instalação do Docker](https://docs.docker.com/get-docker/)

## Como Começar

1. Clone este repositório:
   ```bash
   git clone https://github.com/prinako/ru-server-docker.git
   cd ru-server-docker
   ```

2. Construa a imagem Docker:
   ```bash
   docker build -t ghcr.io/prinako/ru-server .
   ```

3. Execute o contêiner Docker:
   ```bash
   docker run -p PORTA_ESCOLHIDA:PORTA_CONTAINER -d ghcr.io/prinako/ru-server
   ```

   Substitua `PORTA_ESCOLHIDA` pela porta desejada em sua máquina host e `PORTA_CONTAINER` pela porta exposta pela sua aplicação dentro do contêiner Docker.

4. O servidor RU estará disponível em `http://localhost:PORTA_ESCOLHIDA`.

## Personalização

Para personalizar as configurações do servidor, talvez seja necessário modificar o Dockerfile ou fornecer variáveis de ambiente durante o comando `docker run`.

## Contribuições

Se deseja contribuir para este projeto, por favor, siga as diretrizes de contribuição disponíveis em [CONTRIBUTING.md](CONTRIBUTING.md).

## Problemas e Sugestões

Se encontrar problemas ou tiver sugestões, sinta-se à vontade para abrir uma [issue](https://github.com/prinako/ru-server-docker/issues).

## Licença

Este projeto é licenciado sob a Licença MIT - consulte o arquivo [LICENSE](LICENSE) para obter detalhes.
