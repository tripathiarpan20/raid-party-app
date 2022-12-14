import * as THREE from 'three';
import React, {useState, useEffect, useContext, useRef} from 'react';
import classnames from 'classnames';
import metaversefile from 'metaversefile';
import style from './DragAndDrop.module.css';

import {world} from 'engine/world.js';
import {getRandomString, handleBlobUpload, handleUpload} from 'engine/util.js';
import game from 'engine/game.js';
import {getRenderer} from 'engine/renderer.js';
import cameraManager from 'engine/camera-manager.js';

import {
  registerIoEventHandler,
  unregisterIoEventHandler,
} from 'components/general/io-handler/IoHandler.jsx';
import {ObjectPreview} from './ObjectPreview.jsx';
import {AppContext} from 'App';
import CustomButton from 'components/general/custom-button';
import NFTDetailsForm from 'components/web3/NFTDetailsForm';
import useNFTContract from 'hooks/useNFTContract';
import useSolanaNFTContract from 'hooks/useSolanaNFTContract';
import {isChainSupported} from 'hooks/useChain';
import {ChainContext} from 'hooks/chainProvider';

import {GenericLoadingMessage, registerLoad} from './LoadingBox.jsx';

const APP_3D_TYPES = ['glb', 'gltf', 'vrm'];
const timeCount = 6000;

const _upload = () =>
  new Promise((accept, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    // input.setAttribute('webkitdirectory', '');
    // input.setAttribute('directory', '');
    input.setAttribute('multiple', '');
    input.click();
    input.addEventListener('change', async e => {
      // const name = 'Loading';
      // const description = e.target.files ? e.target.files[0].name : `${e.target.files.length} files`;
      // const load = registerLoad(name, description, 0);
      const o = await uploadCreateApp(e.target.files);
      // load.end();
    });
  });
const _isJsonItem = item => item?.kind === 'string';
const uploadCreateApp = async (item, {drop = false}) => {
  let u;
  {
    let load = null;
    u = await handleUpload(item, {
      onTotal(total) {
        const type = 'upload';
        const name = item.name;
        load = registerLoad(type, name, 0, total);
      },
      onProgress(e) {
        if (load) {
          load.update(e.loaded, e.total);
        } else {
          const type = 'upload';
          const name = item.name;
          load = registerLoad(type, name, e.loaded, e.total);
        }
      },
    });
    if (load) {
      load.end();
    }
  }

  let o = null;
  if (u) {
    const type = 'download';
    const name = item.name;
    const load = registerLoad(type, name);
    try {
      o = await metaversefile.createAppAsync({
        start_url: u,
        in_front: drop,
        components: {
          physics: true,
        },
      });
    } catch (err) {
      console.warn(err);
    }
    load.end();
  }

  if (o) {
    o.contentId = u;
    o.instanceId = getRandomString();
    return o;
  } else {
    return null;
  }
};

const DragAndDrop = () => {
  const {state, setState, account, chain} = useContext(AppContext);
  const [queue, setQueue] = useState([]);
  const [currentApp, setCurrentApp] = useState(null);
  const {mintNFT, minting, error, setError, WebaversecontractAddress} =
    useNFTContract(account.currentAddress);
  const {mintSolanaNFT, getNftsForOwner} = useSolanaNFTContract(
    account.currentAddress,
  );
  const [mintComplete, setMintComplete] = useState(false);
  const [pendingTx, setPendingTx] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const {selectedChain} = useContext(ChainContext);
  const canvasRef = useRef(null);

  useEffect(() => {
    function keydown(e) {
      if (game.inputFocused()) return true;

      switch (e.which) {
        case 79: {
          // O
          (async () => {
            const app = await _upload();
            setQueue(queue.concat([app]));
          })();

          return false;
        }
        case 27: {
          // esc
          setCurrentApp(null);

          return false;
        }
      }
    }
    registerIoEventHandler('keydown', keydown);
    return () => {
      unregisterIoEventHandler('keydown');
    };
  }, []);

  useEffect(() => {
    function dragover(e) {
      e.preventDefault();
    }
    window.addEventListener('dragover', dragover);
    const drop = async e => {
      e.preventDefault();

      const renderer = getRenderer();
      console.log(renderer);
      if (e.target === renderer?.domElement) {
        /* const renderer = getRenderer();
        const rect = renderer.domElement.getBoundingClientRect();
        localVector2D.set(
          ( e.clientX / rect.width ) * 2 - 1,
          - ( e.clientY / rect.height ) * 2 + 1
        );
        localRaycaster.setFromCamera(localVector2D, camera);
        const dropZOffset = 2;
        const position = localRaycaster.ray.origin.clone()
          .add(
            localVector2.set(0, 0, -dropZOffset)
              .applyQuaternion(
                localQuaternion
                  .setFromRotationMatrix(localMatrix.lookAt(
                    localVector3.set(0, 0, 0),
                    localRaycaster.ray.direction,
                    localVector4.set(0, 1, 0)
                  ))
              )
          );
        const quaternion = camera.quaternion.clone(); */

        const items = Array.from(e.dataTransfer.items);
        await Promise.all(
          items.map(async item => {
            const drop = _isJsonItem(item);
            const app = await uploadCreateApp(item, {
              drop,
            });
            if (app) {
              if (drop) {
                world.appManager.importApp(app);
                setState({openedPanel: null});
              } else {
                setQueue(queue.concat([app]));
              }
            }
          }),
        );

        /* let arrowLoader = metaverseUi.makeArrowLoader();
        arrowLoader.position.copy(position);
        arrowLoader.quaternion.copy(quaternion);
        scene.add(arrowLoader);
        arrowLoader.updateMatrixWorld();

        if (arrowLoader) {
          scene.remove(arrowLoader);
          arrowLoader.destroy();
        } */
      }
    };
    window.addEventListener('drop', drop);
    return () => {
      window.removeEventListener('dragover', dragover);
      window.removeEventListener('drop', drop);
    };
  }, []);

  useEffect(() => {
    if (queue.length > 0 && !currentApp) {
      const app = queue[0];
      console.log('set app', app);
      setCurrentApp(app);
      setQueue(queue.slice(1));
      setState({openedPanel: null});

      if (cameraManager.pointerLockElement) {
        cameraManager.exitPointerLock();
      }
    }
  }, [queue, currentApp]);

  const _currentAppClick = e => {
    e.preventDefault();
    e.stopPropagation();
  };
  const _importApp = app => {
    const localPlayer = metaversefile.useLocalPlayer();
    const position = localPlayer.position
      .clone()
      .add(new THREE.Vector3(0, 0, -2).applyQuaternion(localPlayer.quaternion));
    const quaternion = localPlayer.quaternion;

    app.position.copy(position);
    app.quaternion.copy(quaternion);
    app.updateMatrixWorld();

    world.appManager.importApp(app);
  };
  const _drop = async e => {
    e.preventDefault();
    e.stopPropagation();

    if (currentApp) {
      _importApp(currentApp);
      setCurrentApp(null);
    }
  };
  const _equip = e => {
    e.preventDefault();
    e.stopPropagation();

    if (currentApp) {
      const app = currentApp;
      _importApp(app);
      app.activate();
      setCurrentApp(null);
    }
  };
  const _mint = async e => {
    e.preventDefault();
    e.stopPropagation();

    if (currentApp) {
      const app = currentApp;

      if (account.walletType === 'metamask') {
        await mintNFT(
          app,
          previewImage,
          () => {
            setPreviewImage(null);
            setCurrentApp(null);
            setPendingTx(true);
          },
          () => {
            setMintComplete(true);
            setPendingTx(false);
          },
        );
      }

      if (account.walletType === 'phantom') {
        await mintSolanaNFT(
          app,
          previewImage,
          () => {
            setPreviewImage(null);
            setCurrentApp(null);
            setPendingTx(true);
          },
          () => {
            setMintComplete(true);
            setPendingTx(false);
          },
        );
      }
    }
    setCurrentApp(null);
  };
  const _cancel = e => {
    e.preventDefault();
    e.stopPropagation();

    setCurrentApp(null);
  };

  const name = currentApp ? currentApp.name : '';
  const appType = currentApp ? currentApp.appType : '';

  const [objectName, setObjectName] = useState('');
  const [objectType, setObjectType] = useState('');

  useEffect(() => {
    if (mintComplete) {
      const timer = setTimeout(() => {
        setMintComplete(false);
      }, timeCount);
      return () => {
        clearTimeout(timer);
      };
    }
  }, [mintComplete]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError('');
      }, timeCount);
      return () => {
        clearTimeout(timer);
      };
    }
  }, [error]);

  async function createPreview() {
    const filename = `${name}-preview.png`;
    const type = 'upload';
    canvasRef.current.toBlob(async function (blob) {
      let load = null;
      const previewURL = await handleBlobUpload(filename, blob, {
        onTotal(total) {
          load = registerLoad(type, filename, 0, total);
        },
        onProgress(e) {
          if (load) {
            load.update(e.loaded, e.total);
          } else {
            load = registerLoad(type, filename, e.loaded, e.total);
          }
        },
      });

      if (load) {
        load.end();
      }
      setPreviewImage(previewURL);
    });
  }

  useEffect(() => {
    setPreviewImage(null);
    if (!currentApp) return;

    console.log('APPPPPPP:', currentApp);

    if (currentApp?.name) setObjectName(currentApp.name);
    if (currentApp?.appType) setObjectType(currentApp.appType);

    if (APP_3D_TYPES.includes(currentApp.appType)) {
      const timer = setTimeout(() => {
        createPreview();
      }, timeCount / 2);
      return () => {
        clearTimeout(timer);
      };
    }
  }, [currentApp]);

  return (
    <div className={style.dragAndDrop}>
      <GenericLoadingMessage
        open={minting}
        name={'Minting'}
        detail={'Creating NFT...'}
      ></GenericLoadingMessage>
      <GenericLoadingMessage
        open={mintComplete}
        name={'Minting Complete'}
        detail={'Press [Tab] to use your inventory.'}
      ></GenericLoadingMessage>
      <GenericLoadingMessage
        open={error}
        name={'Error'}
        detail={error}
      ></GenericLoadingMessage>
      <div
        className={classnames(style.modalWrap, currentApp ? style.open : null)}
        onClick={_currentAppClick}
      >
        <div className={style.modalTitle}>Upload Object</div>
        <div className={style.modalContentWrap}>
          <div className={style.itemPreviewBoxWrap}>
            <div className={style.itemPreviewBox}>
              <div className={style.bg} />
              <div className={style.mask}>
                <ObjectPreview
                  object={currentApp}
                  className={style.canvas}
                  ref={canvasRef}
                />
              </div>
            </div>
          </div>
          <div className={style.info}>
            <h2>{objectName}</h2>
            <div className={style.type}>
              <span className={style.label}>Item type:</span> {objectType}
            </div>
            <NFTDetailsForm
              initialName={name}
              previewImage={previewImage}
              types={APP_3D_TYPES}
              refreshPreview={createPreview}
              onChange={({name, details}) => {
                if (currentApp) {
                  currentApp.name = name;
                  currentApp.description = details;
                }
              }}
            />
          </div>
          <div className={style.actions}>
            <CustomButton
              theme="light"
              text="Drop"
              size={14}
              className={style.button}
              onClick={_drop}
            />
            <CustomButton
              theme="light"
              text="Equip"
              size={14}
              className={style.button}
              onClick={_equip}
            />
            <CustomButton
              theme="light"
              text={`Mint on ${
                account.walletType === 'phantom' ? 'Solana' : selectedChain.name
              }`}
              disabled={
                !isChainSupported(selectedChain) ||
                !account.currentAddress ||
                pendingTx
              }
              size={14}
              className={style.button}
              onClick={_mint}
            />
            <CustomButton
              theme="dark"
              text="Cancel"
              size={14}
              className={style.button}
              onClick={_cancel}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
export {DragAndDrop};
