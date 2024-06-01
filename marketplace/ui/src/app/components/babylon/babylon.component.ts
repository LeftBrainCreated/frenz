import { Component, Input } from '@angular/core';
import * as BABYLON from '@babylonjs/core/Legacy/legacy';
import 'babylonjs-loaders';
import '@babylonjs/loaders/OBJ/objFileLoader';
import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { Vector3 } from "@babylonjs/core/Maths/math";
import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";
import { MeshBuilder, SceneLoader } from '@babylonjs/core';

import "@babylonjs/core/Materials/standardMaterial";
import "@babylonjs/core/Meshes/Builders/sphereBuilder";
import "@babylonjs/core/Meshes/Builders/boxBuilder";
import "@babylonjs/core/Meshes/Builders/groundBuilder";
import { UiService } from 'src/app/services/ui.service';

import { Breadcrumb } from 'src/app/interfaces/breadcrumb';
import { Collection } from 'src/app/interfaces/collection';
import { AlchemyService } from 'src/app/services/alchemy.service';
import { Asset } from 'src/app/interfaces/asset';
import { MarketplaceService } from 'src/app/services/marketplace.service';
import Web3 from 'web3';
import { ComponentArbiterService } from 'src/app/services/component-arbiter.service';

const fixtureLength = 2.28;

@Component({
  selector: 'app-babylon',
  templateUrl: './babylon.component.html',
  styleUrls: ['./babylon.component.scss']
})
export class BabylonComponent {

  @Input() isMobile: boolean = false

  loading: boolean = true;

  engine!: Engine;
  startPosition = new Vector3(0, 10, 45);

  positionSlateNorth = new Vector3(-.15, 6.2, 9.8);
  positionSlateEast = new Vector3(9.8, 5.5, 0);
  positionSlateSouth = new Vector3(0, 5.5, -9.8);
  positionSlateWest = new Vector3(-9.8, 5.5, 0);

  scaledUp: boolean = false;

  collectionList: Collection[];
  selectedCollection?: Collection;
  assets?: Asset[];
  ownedAssets?: Asset[];
  selectedAsset?: Asset;
  singleViewId: number = 0;

  walletConnected: boolean = false;
  walletAddress?: string;

  collectionPanelHidden = true;
  previewPanel!: HTMLElement | null;
  multiView: boolean = true;
  lastPanelName: string = '';
  splashPanel: boolean = true;

  frameRate: number = 70;
  scene!: Scene;
  camera!: FreeCamera;
  currentView: viewType = viewType.market;
  currentPosition: number = 1;

  navPos: number = 0;

  constructor(
    private uiService: UiService,
    private alchemy: AlchemyService,
    private mpWeb3: MarketplaceService,
    private arbiter: ComponentArbiterService
  ) { }

  ngOnInit() {
    let canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
    this.launchBabylon(canvas);

    this.engine.runRenderLoop(() => {
      this.scene.render();
    });

    this.arbiter.walletConnected$.subscribe(wallet => {
      if (wallet) {
        this.walletConnected = true;
        this.walletAddress = wallet.selectedAddress;
        Promise.all([
          this.alchemy.getNFTsForWallet(wallet.selectedAddress),
        ]).then(async ([nftsResult]) => {
          this.loading = false;
        });
        if (this.selectedAsset) {
          this.selectedAsset.owned = Web3.utils.toChecksumAddress(this.selectedAsset.owner) == Web3.utils.toChecksumAddress(wallet.selectedAddress)
        }
      }
    })

    this.loadListeners();
  }

  ngAfterViewInit() {
    this.previewPanel = document.getElementById("skewed-up");
    this.addTempPanels(this.scene)
    this.alchemy.getCollectionsForMarketplace();
  }


  // just setup code for the canvas
  // handles initial setting for camera, objects, and light source
  async launchBabylon(canvas: HTMLCanvasElement): Promise<void> {

    // This creates and positions a free camera (non-mesh)
    this.engine = new Engine(canvas)
    this.scene = new Scene(this.engine);
    this.camera = new BABYLON.UniversalCamera("cameraMain", new BABYLON.Vector3(0, 10, 45), this.scene);
    this.camera.setTarget(new BABYLON.Vector3(0, 8, 0));
    this.camera.attachControl(canvas, true);
    this.scene.cameras[0].attachControl(canvas);
    this.camera.speed = 0.5;

    await this.addScenario(this.scene);
  }

  // Target View
  getStartPosition(): Vector3 {
    return new Vector3(0, 40, -50);
  }

  getCameraTargetAnimation(finalTarget: Vector3) {
    var animationTarget = new BABYLON.Animation(
      "myAnimationTarget",                          // name (can be anything)
      "target",                                     // animation script target
      this.frameRate * 1.8,                                           // frames per second
      BABYLON.Animation.ANIMATIONTYPE_VECTOR3,      // datatype (3d Vector used)
      BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT  // loopmode
    );

    var keys = [];

    // start where the current target is
    keys.push({
      frame: 0,
      value: this.camera.target.clone(),
    });

    keys.push({
      frame: 50,
      value: finalTarget,
    });

    animationTarget.setKeys(keys);

    return animationTarget;
  }

  selectObject(view: viewType, selectedObject: any) {
    var bc: Breadcrumb = {
      viewType: this.currentView,
      collectionAddress: this.selectedCollection?.contractAddress,
      assetId: this.selectedAsset?.tokenId
    }

    this.uiService.pushToBreadcrumb(bc);

    switch (view) {
      case viewType.market:
        break;

      case viewType.collection:
        this.alchemy.getNFTsForCollection(selectedObject.contractAddress);
        this.currentView = viewType.collection;
        this.selectedCollection = selectedObject

        this.moveCamera();
        break;

      case viewType.asset:
        this.selectedAsset = selectedObject;
        this.currentView = viewType.asset;
        break;

      case viewType.wallet:
        break;
    }

  }

  spinCamera(finalPosition: Vector3, startPosition: Vector3 = this.camera.position.clone()) {

    var frame = 0;
    var keys = [];

    var animationTarget = new BABYLON.Animation(
      "cameraMain",
      "position",
      this.frameRate * 2,
      BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
      BABYLON.Animation.ANIMATIONLOOPMODE_RELATIVE
    );

    keys.push({ frame: 0, value: startPosition });
    keys.push({ frame: 50, value: finalPosition });

    animationTarget.setKeys(keys);

    return animationTarget;

  };

  // Camera Position
  moveToInitialPosition(finalPosition: Vector3, startPos: Vector3 = this.camera.position.clone()) {
    // this.addTempPanels(this.scene)

    var cameraAnimation = new BABYLON.Animation(
      "cameraMain",
      "position",
      this.frameRate / 2,
      BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
      BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT,
      true
    );

    var keys = [];

    keys.push({
      frame: 0,
      value: startPos,
      // outTangent: new BABYLON.Vector3(1, 0, 0)
    });

    keys.push({
      frame: 40,
      value: new BABYLON.Vector3(-16, 10, 14),
    });

    keys.push({
      frame: 70,
      value: new BABYLON.Vector3(-14, 16, -18),
    });

    keys.push({
      frame: 75,
      value: new BABYLON.Vector3(-10, 14, -15),
    });

    keys.push({
      frame: 85,
      value: new BABYLON.Vector3(2, 8, -8),
    });

    keys.push({
      frame: 100,
      // inTangent: new BABYLON.Vector3(-1, 0, 0),
      value: finalPosition,
    });

    cameraAnimation.setKeys(keys);

    return cameraAnimation;
  }

  moveCamera(position: number = 0) {
    var pos: Vector3;
    var tar: Vector3;
    var panelName: string;

    if (position == 0) {
      position = this.currentPosition;
      while (position == this.currentPosition) {
        position = Math.round(Math.random() * 100) % 4 + 1
      }
    }

    switch (position) {
      case 1:
        pos = this.positionSlateSouth;
        tar = this.positionSlateNorth;
        panelName = "imagePlaneNorth";
        break;

      case 2:
        pos = this.positionSlateWest;
        tar = this.positionSlateEast;
        panelName = "imagePlaneEast";
        break;

      case 3:
        pos = this.positionSlateNorth;
        tar = this.positionSlateSouth
        panelName = "imagePlaneSouth";
        break;

      case 4:
        pos = this.positionSlateEast;
        tar = this.positionSlateWest;
        panelName = "imagePlaneWest";
        break;

      default:
        pos = this.positionSlateSouth;
        tar = this.positionSlateNorth;
        panelName = "imagePlaneNorth";
    }

    var moveFunction: BABYLON.Animation;
    if (position == -1) {
      moveFunction = this.moveToInitialPosition(pos)
      this.splashPanel = false;
      this.currentView = viewType.market;
    } else {
      moveFunction = this.spinCamera(pos);
    }

    this.scaledUp = false;
    var m = this.scene.getMeshByName(this.lastPanelName);

    setTimeout(() => {
      m?.setEnabled(true);
      this.collectionPanelHidden = true;

      var anim = this.scene.beginDirectAnimation(
        this.scene.cameras[0]
        , [
          moveFunction
          , this.getCameraTargetAnimation(tar)
        ], 0, 100
        , false
      ).onAnimationEnd! = () => {
        var m = this.scene.getMeshByName(panelName);
        m?.setEnabled(false);

        this.collectionPanelHidden = false;
        this.scaledUp = true;
        this.lastPanelName = panelName;
      }
    }, 200);
  }

  addTempPanels(scene: Scene) {
    var gmat = new BABYLON.StandardMaterial("imageDisplay", scene);
    gmat.alpha = 1.0;

    var placemat1 = new BABYLON.StandardMaterial("placeholder1", scene);
    placemat1.alpha = 1.0;
    var placemat2 = new BABYLON.StandardMaterial("placeholder2", scene);
    placemat2.alpha = 1.0;
    var placemat3 = new BABYLON.StandardMaterial("placeholder3", scene);
    placemat3.alpha = 1.0;
    var placemat4 = new BABYLON.StandardMaterial("placeholder4", scene);
    placemat4.alpha = 1.0;

    var texture = new BABYLON.Texture("./assets/images/collection_preview.jpg", scene);
    var placeholder1 = new BABYLON.Texture("./assets/images/icons_all.png", scene);
    var placeholder2 = new BABYLON.Texture("./assets/images/icons_blue.png", scene);
    var placeholder3 = new BABYLON.Texture("./assets/images/icons_white.png", scene);
    var placeholder4 = new BABYLON.Texture("./assets/images/icons_purple.png", scene);

    gmat.diffuseTexture = texture;
    placemat1.diffuseTexture = placeholder1;
    placemat2.diffuseTexture = placeholder2;
    placemat3.diffuseTexture = placeholder3;
    placemat4.diffuseTexture = placeholder4;

    var meshProps = {
      size: 2,
      width: 7,
      height: 7,
      updateable: true
    };

    var imageDisplayNorth = MeshBuilder.CreatePlane("imagePlaneNorth", meshProps);
    var imageDisplayEast = MeshBuilder.CreatePlane("imagePlaneEast", meshProps);
    var imageDisplaySouth = MeshBuilder.CreatePlane("imagePlaneSouth", meshProps);
    var imageDisplayWest = MeshBuilder.CreatePlane("imagePlaneWest", meshProps);

    imageDisplayNorth.position = this.positionSlateNorth;
    imageDisplayEast.position = this.positionSlateEast;
    imageDisplaySouth.position = this.positionSlateSouth;
    imageDisplayWest.position = this.positionSlateWest;

    gmat.specularColor = new BABYLON.Color3(0, 0, 0);
    placemat1.specularColor = new BABYLON.Color3(0, 0, 0);
    placemat2.specularColor = new BABYLON.Color3(0, 0, 0);
    placemat3.specularColor = new BABYLON.Color3(0, 0, 0);
    placemat4.specularColor = new BABYLON.Color3(0, 0, 0);

    imageDisplayNorth.material = gmat;
    imageDisplayEast.material = placemat1;
    imageDisplaySouth.material = placemat2;
    imageDisplayWest.material = placemat3;

    //rotate side panels 90deg
    imageDisplayEast.rotate(new BABYLON.Vector3(0, 1, 0), 1.5708);
    //rotate side panels 180deg
    imageDisplaySouth.rotate(new BABYLON.Vector3(0, 1, 0), 1.5708 * 2);
    //rotate side panels 270deg
    imageDisplayWest.rotate(new BABYLON.Vector3(0, 1, 0), 1.5708 * 3);
  }

  async addScenario(scene: Scene) {
    var intensity = 10;
    const light1 = new BABYLON.PointLight("spot1", new BABYLON.Vector3(fixtureLength * 4, 1, fixtureLength * 4), scene);
    light1.intensity = intensity;

    const light2 = new BABYLON.PointLight("spot2", new BABYLON.Vector3(fixtureLength * -4, 1, fixtureLength * 4), scene);
    light2.intensity = intensity;

    const light3 = new BABYLON.PointLight("spot3", new BABYLON.Vector3(fixtureLength * 4, 1, fixtureLength * -4), scene);
    light3.intensity = intensity;

    const light4 = new BABYLON.PointLight("spot4", new BABYLON.Vector3(fixtureLength * -4, 1, fixtureLength * -4), scene);
    light4.intensity = intensity;

    const mesh = SceneLoader.ImportMesh(
      "",
      "assets/models/",
      "gal_2.glb",
      scene,
      (newMeshes) => {
        newMeshes[0].position.y = 0;
        newMeshes[0].position.z = 0;
        newMeshes[0].scaling = new Vector3(5, 5, 5);
      }
    );

    // Skybox
    var skybox = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 1000.0 }, scene);
    var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("assets/textures/skybox/cpunk", scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
    skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    skybox.material = skyboxMaterial;
  }

  async loadListeners() {
    this.uiService.switchViewModeObs.subscribe((multiView: boolean) => {
      this.multiView = multiView;
    })

    this.uiService.scaleObjectObs.subscribe((scaleUp: boolean) => {
      this.scaledUp = scaleUp;
    })

    this.alchemy.CollectionResults.subscribe((res: Asset[]) => {
      this.assets = res;
    })

    this.alchemy.MarketplaceCollectionsObs.subscribe((res) => {
      this.collectionList = res;
      res.forEach((element: any) => {
        this.alchemy.whitelistedCollections.push(Web3.utils.toChecksumAddress(element['contractAddress']));
      });
    })

    this.uiService.moveToWalletObs.subscribe((res) => {
      this.moveCamera();
      this.currentView = viewType.wallet;
    })



    this.alchemy.OwnedAssetsObs.subscribe((res) => {
      this.ownedAssets = res;

      this.mpWeb3.ownedAssets = [];
      this.ownedAssets.forEach((oa) => {
        this.mpWeb3.ownedAssets.push({ contractAddress: oa.contract.address, tokenId: oa.tokenId });
      })
    })

    this.uiService.enterMarketplaceObs.subscribe(() => {
      if (this.splashPanel) {
        this.moveCamera(-1);
      }
    })

    this.uiService.changeConnectedStateObs.subscribe((res) => {
      this.alchemy.getNFTsForWallet(this.mpWeb3.selectedAddress);
      this.mpWeb3.getListedAssets();
    })

    this.uiService.CaptureBreadcrumbObs.subscribe(() => {
      this.uiService.pushToBreadcrumb({
        viewType: this.currentView,
        collectionAddress: this.selectedCollection?.contractAddress,
        assetId: this.selectedAsset?.tokenId
      })
    })

    this.uiService.BreadcrumbPopObs.subscribe((res: Breadcrumb) => {
      // this.navPos = this.navPos + res;

      this.currentView = res.viewType;
      switch (this.currentView) {
        case 1:
          this.moveCamera();
          break;
        case 2:
          this.alchemy.getNFTsForCollection(res.collectionAddress);
          break;

        case 3:
          this.alchemy.getNFTMetadata(res.collectionAddress, res.assetId)
            .then((asset) => {
              this.selectedAsset = asset;
            })
          break;

        case 4:
          this.moveCamera();
      }

    })
  }
}

enum viewType {
  splash,
  market,
  collection,
  asset,
  wallet
}

enum viewPanels {
  North,
  East,
  South,
  West
}