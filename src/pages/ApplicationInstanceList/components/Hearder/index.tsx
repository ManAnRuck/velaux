import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import { Grid, Select, Button, Dialog, Message, Icon } from '@b-design/ui';
import type { DeliveryTarget } from '../../../../interface/deliveryTarget';
import Translation from '../../../../components/Translation';
import {
  recycleApplicationEnvbinding,
  deleteApplicationEnvbinding,
} from '../../../../api/application';
import type { ApplicationDetail, ApplicationStatus } from '../../../../interface/application';
import { If } from 'tsx-control-statements/components';

type Props = {
  targets?: DeliveryTarget[];
  applicationStatus?: ApplicationStatus;
  applicationDetail?: ApplicationDetail;
  envName: string;
  updateQuery: (targetName: string) => void;
  updateEnvs: () => void;
  updateStatusShow: (show: boolean) => void;
  refresh: () => void;
  t: (key: string) => any;
};

type State = {
  recycleLoading: boolean;
  deleteLoading: boolean;
  refreshLoading: boolean;
  showStatus: boolean;
};

class Hearder extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      recycleLoading: false,
      deleteLoading: false,
      refreshLoading: false,
      showStatus: false,
    };
  }
  componentDidMount() {}
  handleChange = (value: string) => {
    this.props.updateQuery(value);
  };
  recycleEnv = async () => {
    Dialog.confirm({
      content: 'Are you sure you want to reclaim the current environment?',
      onOk: () => {
        const { applicationDetail, envName } = this.props;
        if (applicationDetail) {
          recycleApplicationEnvbinding({ appName: applicationDetail.name, envName: envName }).then(
            (re) => {
              if (re) {
                Message.success('recycle applicationn env success');
              }
            },
          );
        }
      },
    });
  };
  deleteEnv = async () => {
    Dialog.confirm({
      content: 'Are you sure you want to delete the current environment?',
      onOk: () => {
        const { applicationDetail, envName, updateEnvs } = this.props;
        if (applicationDetail) {
          deleteApplicationEnvbinding({ appName: applicationDetail.name, envName: envName }).then(
            (re) => {
              if (re) {
                Message.success('delete applicationn env success');
                updateEnvs();
              }
            },
          );
        }
      },
    });
  };

  refresh = async () => {
    this.props.refresh();
  };
  showStatus = () => {
    this.refresh();
    this.setState({ showStatus: true });
  };

  render() {
    const { Row, Col } = Grid;
    const { t, updateStatusShow } = this.props;
    const { recycleLoading, deleteLoading, refreshLoading } = this.state;
    const clusterPlacehole = t('Delivery Target Selector').toString();
    const { targets, applicationStatus } = this.props;
    const clusterList = (targets || []).map((item: DeliveryTarget) => ({
      label: item.alias,
      value: item.name,
    }));
    const getAppStatusShowType = (status: string | undefined) => {
      if (!status) {
        return 'notice';
      }
      switch (status) {
        case 'running':
          return 'success';
        case 'workflowFinished':
          return 'success';
        case 'unhealthy':
          return 'error';
      }
      return 'warning';
    };
    return (
      <div>
        <Row className="boder-radius-8">
          <Col span="6" style={{ marginBottom: '16px' }}>
            <Select
              mode="single"
              onChange={this.handleChange}
              dataSource={clusterList}
              placeholder={clusterPlacehole}
              hasClear
            />
          </Col>
          <Col span={8}>
            <If condition={applicationStatus}>
              <Message
                type={getAppStatusShowType(applicationStatus?.status)}
                size="medium"
                style={{ marginLeft: '16px', padding: '8px' }}
              >
                <Translation>{`Application is ${
                  applicationStatus?.status || 'initing'
                }`}</Translation>{' '}
                <a onClick={() => updateStatusShow(true)}>
                  <Translation>Check the details</Translation>
                </a>
              </Message>
            </If>
          </Col>
          <Col span="10" className="flexright" style={{ marginBottom: '16px' }}>
            <Button type="secondary" loading={refreshLoading} onClick={this.refresh}>
              <Icon type="refresh" />
            </Button>
            <If condition={!applicationStatus || !applicationStatus.status}>
              <Button
                style={{ marginLeft: '16px' }}
                loading={deleteLoading}
                onClick={this.deleteEnv}
              >
                <Translation>Delete</Translation>
              </Button>
            </If>
            <If condition={applicationStatus && applicationStatus.status}>
              <Button
                loading={recycleLoading}
                onClick={this.recycleEnv}
                type="primary"
                style={{ marginLeft: '16px' }}
              >
                <Translation>Recycle</Translation>
              </Button>
            </If>
          </Col>
        </Row>
      </div>
    );
  }
}

export default withTranslation()(Hearder);