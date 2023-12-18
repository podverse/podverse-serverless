# podverse-serverless

## Developing Podverse modules

Podverse maintains several different modules which are imported across apps. Please read [Developing Podverse modules](https://github.com/podverse/podverse-ops/blob/master/docs/how-to-develop-podverse-modules.md) for a workflow you can use to make code changes to this module locally.

## Local dev

```sh
yarn dev
```

or

```sh
yarn dev:watch
```

Should spin up a server on port 3030, making a request to http://localhost:3030/api/hello should respond

## Build

```sh
yarn && yarn build
```

## Upload to S3

Upload the resulting `index.zip` to s3

## create stack

```sh
aws --region=us-east-1 cloudformation create-stack \
  --stack-name minimal-example \
  --capabilities CAPABILITY_NAMED_IAM \
  --template-body file://iac/api.yml
```

## list url

```sh
aws --region us-east-1 cloudformation describe-stacks \
  --stack-name minimal-example \
  --query "Stacks[0].Outputs[?OutputKey=='ApiUrl'].OutputValue" \
  --output text
```

## update stack

```sh
aws --region=us-east-1 cloudformation update-stack \
--stack-name minimal-example \
--capabilities CAPABILITY_NAMED_IAM \
--template-body file://iac/api.yml
```
