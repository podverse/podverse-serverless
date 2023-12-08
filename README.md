## Local dev

```sh
npm run dev
```

Should spin up a server on port 3030, making a request to http://localhost:3030/api/hello should respond

## Build

```sh
npm install && npm run build
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
