import {AlchemyWebSigner} from '@alchemy/aa-alchemy';
import {useMutation} from '@tanstack/react-query';
import {useMemo} from 'react';

export const PasskeyAuthComponent = () => {
  // TODO may be able to use pure turnkey signer here or alchemy turnkey signer without iFrame
  // const signer = useMemo(
  //   () =>
  //     new AlchemyWebSigner({
  //       client: {
  //         connection: {
  //           jwt: 'alcht_<KEY>',
  //         },
  //         iframeConfig: {
  //           iframeContainerId: 'turnkey-iframe-container',
  //         },
  //       },
  //     }),
  //   []
  // );

  // TODO Either use turnkey sdk or Alchemy wrapped turnkey sdk whoami call here
  //   const user = .getWhoami()

  // const {
  //   mutate: login,
  //   isPending,
  //   data: user,
  // } = useMutation(
  //   {
  //   mutationFn: () =>
  //     signer.authenticate({
  //       type: 'passkey',
  //       createNew: false,
  //     }),
  // }
  // );

  return (
    <div>
      {/*{user == null || isPending ? (*/}
      {/*  <button onClick={() => login()}>Log in</button>*/}
      {/*) : (*/}
      {/*  <div>*/}
      {/*    <div>Address: {user.address}</div>*/}
      {/*    <div>Email: {user.email}</div>*/}
      {/*  </div>*/}
      {/*)}*/}
    </div>
  );
};
