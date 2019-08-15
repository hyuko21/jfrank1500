#!/bin/bash
openssl req -x509 -newkey rsa:2048 -keyout chave_privada.pem -out chave_publica.pem -days 365
